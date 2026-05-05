<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import RequestForm from './components/RequestForm.vue'
import RequestTable from './components/RequestTable.vue'
import RequestTimeline from './components/RequestTimeline.vue'
import {
  activateRequest as activateRequestApi,
  approveRequest as approveRequestApi,
  createRequest,
  getCurrentUser,
  listMyRequests,
  listRequests,
  rejectRequest as rejectRequestApi
} from './api.js'

const requests = ref([])
const selectedRequest = ref(null)
const activeView = ref('user')
const lastSubmittedRequest = ref(null)
const currentUser = ref(null)
const isLoading = ref(true)
const isSubmittingRequest = ref(false)
const showSubmissionModal = ref(false)
const errorMessage = ref('')
const formVersion = ref(0)

const getRequestApplications = (request) =>
  request?.applications?.length ? request.applications.join(', ') : request?.application || ''

const canAccessAdmin = computed(() =>
  currentUser.value?.roles?.some(role => ['admin', 'approver'].includes(role))
)

const canCreateRequests = computed(() =>
  currentUser.value?.roles?.some(role => ['admin', 'requester'].includes(role))
)

const loadRequests = async (view = activeView.value) => {
  const response = view === 'admin' && canAccessAdmin.value ? await listRequests() : await listMyRequests()
  requests.value = response.requests
  selectedRequest.value = requests.value[0] || null
}

onMounted(async () => {
  try {
    const response = await getCurrentUser()
    currentUser.value = response.user
    await loadRequests()
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
})

watch(activeView, async (view) => {
  if (!currentUser.value) return

  try {
    await loadRequests(view)
  } catch (error) {
    errorMessage.value = error.message
  }
})

const addRequest = async (request) => {
  isSubmittingRequest.value = true
  try {
    const response = await createRequest(request)
    requests.value.unshift(response.request)
    selectedRequest.value = response.request
    lastSubmittedRequest.value = response.request
    showSubmissionModal.value = true
    formVersion.value += 1
  } catch (error) {
    alert(error.message)
  } finally {
    isSubmittingRequest.value = false
  }
}

const replaceRequest = (request) => {
  requests.value = requests.value.map(item => item.id === request.id ? request : item)
  selectedRequest.value = request
}

const approveRequest = async (id) => {
  try {
    const response = await approveRequestApi(id)
    replaceRequest(response.request)
  } catch (error) {
    alert(error.message)
  }
}

const rejectRequest = async (id) => {
  try {
    const response = await rejectRequestApi(id)
    replaceRequest(response.request)
  } catch (error) {
    alert(error.message)
  }
}

const activateRequest = async (id) => {
  try {
    const response = await activateRequestApi(id)
    replaceRequest(response.request)
  } catch (error) {
    alert(error.message)
  }
}

const pendingCount = computed(() =>
  requests.value.filter(r => r.status === 'Pendiente aprobación Gerencia').length
)

const approvedCount = computed(() =>
  requests.value.filter(r => ['Aprobado por Gerencia', 'Aprobado parcial por Gerencia'].includes(r.status)).length
)

const activatedCount = computed(() =>
  requests.value.filter(r => r.status === 'Aplicación habilitada por el Coordinador TIC').length
)

const rejectedCount = computed(() =>
  requests.value.filter(r => r.status === 'Rechazado por Gerencia').length
)

const currentTimelineRequest = computed(() =>
  selectedRequest.value || lastSubmittedRequest.value || requests.value[0] || null
)
</script>

<template>
  <main class="app">
    <section class="hero">
      <div class="brand">
        <img src="./assets/logo-avantika.png" alt="Logo Avantika" class="logo" />
        <div>
          <h1>Autorizaciones Web</h1>
          <p class="subtitle">
            Solicitud, aprobación y seguimiento para la habilitación controlada de WhatsApp, YouTube y LinkedIn.
          </p>
        </div>
      </div>

      <div class="hero-badge">
        <font-awesome-icon icon="fa-solid fa-shield-halved" />
        <span>Control TIC</span>
      </div>
    </section>

    <nav class="view-switch" aria-label="Seleccionar vista">
      <button
        type="button"
        :class="{ active: activeView === 'user' }"
        @click="activeView = 'user'"
      >
        Solicitud de usuario
      </button>

      <button
        v-if="canAccessAdmin"
        type="button"
        :class="{ active: activeView === 'admin' }"
        @click="activeView = 'admin'"
      >
        Administrador
      </button>
    </nav>

    <div v-if="isLoading" class="state-card">
      Cargando información...
    </div>

    <div v-else-if="errorMessage" class="state-card error">
      {{ errorMessage }}
    </div>

    <section v-else-if="activeView === 'user'" class="user-view">
      <RequestForm
        v-if="canCreateRequests"
        :key="formVersion"
        :current-user="currentUser"
        :is-submitting="isSubmittingRequest"
        @submit-request="addRequest"
      />

      <section v-else class="state-card">
        Esta aplicación está habilitada solo para jefes inmediatos o encargados de macroproceso autorizados.
      </section>

      <aside class="user-side-panel">
        <section class="mini-card">
          <div class="mini-card-header">
            <div>
              <p class="section-label">Mis solicitudes</p>
              <h2>Trazabilidad</h2>
            </div>
            <font-awesome-icon icon="fa-solid fa-timeline" />
          </div>

          <div v-if="requests.length" class="request-list">
            <button
              v-for="request in requests"
              :key="request.id"
              type="button"
              class="request-pill"
              :class="{ active: currentTimelineRequest?.id === request.id }"
              @click="selectedRequest = request"
            >
              <strong>{{ request.requestNumber }}</strong>
              <span>{{ getRequestApplications(request) }}</span>
            </button>
          </div>

          <div v-else class="empty-note">
            Tus solicitudes aparecerán aquí después de enviarlas.
          </div>
        </section>

        <RequestTimeline :request="currentTimelineRequest" />
      </aside>
    </section>

    <section v-else-if="canAccessAdmin" class="admin-view">
      <section class="summary-grid">
        <div class="summary-card">
          <span>Pendientes</span>
          <strong>{{ pendingCount }}</strong>
        </div>

        <div class="summary-card">
          <span>Aprobadas</span>
          <strong>{{ approvedCount }}</strong>
        </div>

        <div class="summary-card">
          <span>Habilitadas</span>
          <strong>{{ activatedCount }}</strong>
        </div>

        <div class="summary-card">
          <span>Rechazadas</span>
          <strong>{{ rejectedCount }}</strong>
        </div>
      </section>

      <section class="admin-layout">
        <RequestTable
          :requests="requests"
          @select-request="selectedRequest = $event"
          @approve-request="approveRequest"
          @reject-request="rejectRequest"
          @activate-request="activateRequest"
        />

        <div class="right-panel">
          <RequestTimeline :request="selectedRequest" />
        </div>
      </section>
    </section>

    <div
      v-if="showSubmissionModal && lastSubmittedRequest"
      class="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submission-title"
    >
      <section class="submission-modal">
        <button
          type="button"
          class="modal-close"
          aria-label="Cerrar confirmación"
          @click="showSubmissionModal = false"
        >
          <font-awesome-icon icon="fa-solid fa-xmark" />
        </button>

        <div class="modal-icon">
          <font-awesome-icon icon="fa-solid fa-check" />
        </div>

        <p class="section-label">Registro exitoso</p>
        <h2 id="submission-title">Solicitud enviada</h2>
        <p>
          La solicitud {{ lastSubmittedRequest.requestNumber }} para habilitar
          {{ getRequestApplications(lastSubmittedRequest) }} quedó registrada y enviada para aprobación.
        </p>

        <dl class="request-summary">
          <div>
            <dt>Jefe inmediato</dt>
            <dd>{{ lastSubmittedRequest.requesterName }}</dd>
          </div>
          <div>
            <dt>Colaborador</dt>
            <dd>{{ lastSubmittedRequest.collaboratorName }}</dd>
          </div>
          <div>
            <dt>Estado</dt>
            <dd>{{ lastSubmittedRequest.status }}</dd>
          </div>
          <div>
            <dt>Quién aprueba</dt>
            <dd>{{ lastSubmittedRequest.managerName }}</dd>
          </div>
          <div>
            <dt>Correo aprobación</dt>
            <dd>{{ lastSubmittedRequest.managerEmail }}</dd>
          </div>
        </dl>

        <button class="submit-btn modal-action" type="button" @click="showSubmissionModal = false">
          Entendido
        </button>
      </section>
    </div>
  </main>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: #f7f9fb;
  padding: 32px;
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  color: #26313d;
}

.hero {
  background: linear-gradient(135deg, #ffffff 0%, #eef7f3 55%, #edf5ff 100%);
  border: 1px solid #e1e8ef;
  border-radius: 28px;
  padding: 30px;
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: center;
  box-shadow: 0 18px 45px rgba(29, 47, 73, 0.08);
}

.brand {
  display: flex;
  gap: 28px;
  align-items: center;
}

.logo {
  width: 170px;
  height: auto;
  object-fit: contain;
  background: white;
  border-radius: 24px;
  padding: 16px;
  border: 1px solid #e7edf2;
}

h1 {
  margin: 0;
  font-size: 34px;
  color: #243347;
}

.subtitle {
  max-width: 760px;
  margin: 10px 0 0;
  color: #637083;
  font-size: 15px;
  line-height: 1.6;
}

.hero-badge {
  display: flex;
  gap: 10px;
  align-items: center;
  background: #173b57;
  color: white;
  padding: 14px 18px;
  border-radius: 999px;
  font-weight: 700;
  white-space: nowrap;
}

.view-switch {
  display: inline-flex;
  gap: 8px;
  background: #e9eef4;
  border: 1px solid #dbe4ed;
  border-radius: 18px;
  padding: 6px;
  margin: 24px 0;
}

.view-switch button {
  border: none;
  border-radius: 13px;
  background: transparent;
  color: #526070;
  cursor: pointer;
  font-size: 14px;
  font-weight: 800;
  padding: 12px 18px;
}

.view-switch button.active {
  background: white;
  color: #173b57;
  box-shadow: 0 10px 22px rgba(24, 48, 80, 0.1);
}

.user-view {
  max-width: 1380px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 0.45fr);
  gap: 20px;
  align-items: start;
}

.state-card {
  background: white;
  border: 1px solid #e4ebf2;
  border-radius: 18px;
  color: #5d6878;
  padding: 22px;
}

.state-card.error {
  background: #fdecec;
  border-color: #f5c2c0;
  color: #b42318;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin: 0 0 24px;
}

.summary-card {
  background: white;
  border: 1px solid #e5ebf1;
  border-radius: 22px;
  padding: 22px;
  box-shadow: 0 12px 30px rgba(24, 48, 80, 0.05);
}

.summary-card span {
  color: #6c7787;
  font-size: 14px;
}

.summary-card strong {
  display: block;
  font-size: 34px;
  margin-top: 8px;
  color: #243347;
}

.admin-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(340px, 0.55fr);
  gap: 24px;
  align-items: start;
}

.right-panel {
  display: grid;
  gap: 20px;
}

.user-side-panel {
  display: grid;
  gap: 20px;
  position: sticky;
  top: 24px;
}

.mini-card {
  background: white;
  border: 1px solid #e4ebf2;
  border-radius: 26px;
  padding: 22px;
  box-shadow: 0 16px 40px rgba(28, 50, 84, 0.07);
}

.mini-card-header {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
  margin-bottom: 16px;
}

.mini-card h2 {
  margin: 0;
  color: #243347;
  font-size: 21px;
}

.mini-card-header svg {
  color: #1c9b75;
  font-size: 20px;
}

.section-label {
  margin: 0 0 6px;
  color: #1c9b75;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 12px;
  font-weight: 800;
}

.request-list {
  display: grid;
  gap: 10px;
  max-height: 260px;
  overflow: auto;
}

.request-pill {
  border: 1px solid #e2e8ef;
  background: #fbfcfd;
  border-radius: 16px;
  padding: 13px;
  text-align: left;
  cursor: pointer;
  display: grid;
  gap: 4px;
  color: #384658;
}

.request-pill.active {
  border-color: #1c9b75;
  background: #effaf5;
}

.request-pill strong {
  color: #243347;
}

.request-pill span {
  color: #697486;
  font-size: 12px;
}

.empty-note {
  background: #f6f8fa;
  border: 1px dashed #cbd5df;
  border-radius: 18px;
  color: #667284;
  padding: 18px;
  text-align: center;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  background: rgba(18, 31, 44, 0.48);
  display: grid;
  place-items: center;
  padding: 22px;
}

.submission-modal {
  position: relative;
  width: min(560px, 100%);
  background: white;
  border-radius: 24px;
  border: 1px solid #e4ebf2;
  padding: 28px;
  box-shadow: 0 30px 80px rgba(12, 23, 35, 0.28);
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  border: 0;
  background: #f1f5f8;
  color: #4c5a6b;
  border-radius: 999px;
  width: 36px;
  height: 36px;
  cursor: pointer;
}

.modal-icon {
  width: 54px;
  height: 54px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #e8f7f1;
  color: #1c9b75;
  font-size: 22px;
  margin-bottom: 14px;
}

.submission-modal h2 {
  margin: 0 0 10px;
  color: #243347;
  font-size: 28px;
}

.submission-modal p {
  margin: 0;
  color: #5f6d7d;
  line-height: 1.55;
}

.request-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 22px 0;
}

.request-summary div {
  background: #f8fafc;
  border: 1px solid #e5ebf1;
  border-radius: 16px;
  padding: 13px;
}

.request-summary dt {
  color: #738092;
  font-size: 12px;
  font-weight: 800;
  margin-bottom: 4px;
}

.request-summary dd {
  margin: 0;
  color: #243347;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.modal-action {
  border: none;
  background: linear-gradient(135deg, #173b57, #1c9b75);
  color: white;
  border-radius: 18px;
  padding: 15px 18px;
  font-weight: 800;
  cursor: pointer;
  font-size: 15px;
  box-shadow: 0 14px 30px rgba(23, 59, 87, 0.22);
  width: 100%;
  margin-top: 0;
}

@media (max-width: 1100px) {
  .hero,
  .brand {
    flex-direction: column;
    align-items: flex-start;
  }

  .admin-layout,
  .user-view,
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .user-side-panel {
    position: static;
  }
}

@media (max-width: 700px) {
  .app {
    padding: 18px;
  }

  .logo {
    width: 135px;
  }

  .view-switch {
    display: grid;
    width: 100%;
  }

  .request-summary {
    grid-template-columns: 1fr;
  }
}
</style>
