<script setup>
defineProps({
  requests: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select-request', 'approve-request', 'reject-request', 'activate-request'])

const formatDate = (date) => {
  if (!date) return 'Pendiente'
  return new Date(date).toLocaleString('es-CO')
}

const getApplications = (request) =>
  ['Aprobado parcial por Gerencia', 'Aprobado por Gerencia', 'Aplicación habilitada por el Coordinador TIC'].includes(request.status) && request.approvedApplications?.length
    ? request.approvedApplications
    : request.applications?.length ? request.applications : [request.application].filter(Boolean)

const getApplicationsLabel = (request) => {
  if (request.status === 'Aprobado parcial por Gerencia') return 'Aprobadas'
  if (request.status === 'Aprobado por Gerencia') return 'Aprobado TOTAL'
  if (request.status === 'Aplicación habilitada por el Coordinador TIC') return 'Habilitadas'
  return 'Solicitadas'
}

const getStatusClass = (status) => {
  if (status === 'Pendiente aprobación Gerencia') return 'pending'
  if (['Aprobado por Gerencia', 'Aprobado parcial por Gerencia'].includes(status)) return 'approved'
  if (status === 'Aplicación habilitada por el Coordinador TIC') return 'active'
  if (status === 'Rechazado por Gerencia') return 'rejected'
  return ''
}
</script>

<template>
  <section class="table-card">
    <div class="table-header">
      <div>
        <p class="section-label">Control centralizado</p>
        <h2>Solicitudes registradas</h2>
      </div>
    </div>

    <div v-if="requests.length === 0" class="empty">
      Aún no hay solicitudes registradas.
    </div>

    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>No. solicitud</th>
            <th>Aplicación</th>
            <th>Colaborador</th>
            <th>Jefe inmediato</th>
            <th>Macroproceso</th>
            <th>Fecha solicitud</th>
            <th>Decisión Gerencia</th>
            <th>Activación TIC</th>
            <th>Estado</th>
            <th>Acciones prueba</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in requests" :key="item.id" @click="emit('select-request', item)">
            <td>
              <strong>{{ item.requestNumber }}</strong>
            </td>
            <td>
              <small class="app-label">{{ getApplicationsLabel(item) }}</small>
              <div class="app-tags">
                <span v-for="application in getApplications(item)" :key="application">
                  {{ application }}
                </span>
              </div>
            </td>
            <td>
              {{ item.collaboratorName || item.employeeName }}
            </td>
            <td>
              {{ item.requesterName }}
            </td>
            <td>{{ item.area }}</td>
            <td>{{ formatDate(item.createdAt) }}</td>
            <td>{{ formatDate(item.approvedAt || item.rejectedAt) }}</td>
            <td>{{ formatDate(item.activatedAt) }}</td>
            <td>
              <span class="status" :class="getStatusClass(item.status)">
                {{ item.status }}
              </span>
            </td>
            <td class="actions">
              <button
                v-if="!item.approvedAt && !item.rejectedAt"
                @click.stop="emit('approve-request', item.id)"
                class="small-btn approve"
              >
                Simular SI Gerencia
              </button>

              <button
                v-if="!item.approvedAt && !item.rejectedAt"
                @click.stop="emit('reject-request', item.id)"
                class="small-btn reject"
              >
                Simular NO Gerencia
              </button>

              <button
                v-if="item.approvedAt && !item.activatedAt"
                @click.stop="emit('activate-request', item.id)"
                class="small-btn activate"
              >
                Activar TIC
              </button>

              <span v-if="item.activatedAt" class="done">
                Finalizado
              </span>

              <span v-if="item.rejectedAt" class="rejected-text">
                Rechazado
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.table-card {
  margin-top: 0;
  background: white;
  border: 1px solid #e4ebf2;
  border-radius: 26px;
  padding: 24px;
  box-shadow: 0 16px 40px rgba(28, 50, 84, 0.07);
}

.table-header {
  margin-bottom: 18px;
}

.section-label {
  margin: 0 0 6px;
  color: #1c9b75;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 12px;
  font-weight: 800;
}

h2 {
  margin: 0;
  font-size: 22px;
  color: #243347;
}

.empty {
  background: #f6f8fa;
  border: 1px dashed #cbd5df;
  border-radius: 18px;
  padding: 24px;
  color: #667284;
  text-align: center;
}

.table-wrapper {
  overflow-x: auto;
}

.app-label {
  display: block;
  color: #738092;
  font-size: 11px;
  font-weight: 800;
  margin-bottom: 7px;
  text-transform: uppercase;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1150px;
}

th {
  text-align: left;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6f7b8a;
  background: #f7f9fb;
  padding: 14px;
}

td {
  padding: 15px 14px;
  border-bottom: 1px solid #edf1f5;
  color: #3d4b5c;
  font-size: 14px;
  vertical-align: middle;
}

tr {
  cursor: pointer;
  transition: 0.2s ease;
}

tbody tr:hover {
  background: #f8fbfa;
}

td small {
  display: block;
  color: #7b8797;
  margin-top: 4px;
}

.app-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.app-tags span {
  display: inline-flex;
  border-radius: 999px;
  background: #edf5ff;
  color: #2468a2;
  font-size: 12px;
  font-weight: 800;
  padding: 6px 9px;
}

.status {
  display: inline-flex;
  padding: 7px 11px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.status.pending {
  background: #fff7e6;
  color: #a56a00;
}

.status.approved {
  background: #eaf4ff;
  color: #2468a2;
}

.status.active {
  background: #e8f7f1;
  color: #137455;
}

.status.rejected {
  background: #fdecec;
  color: #b42318;
}

.actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.small-btn {
  border: none;
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.small-btn.approve {
  background: #173b57;
  color: white;
}

.small-btn.activate {
  background: #1c9b75;
  color: white;
}

.small-btn.reject {
  background: #fdecec;
  color: #b42318;
}

.done {
  color: #137455;
  font-weight: 800;
  font-size: 12px;
}

.rejected-text {
  color: #b42318;
  font-weight: 800;
  font-size: 12px;
}
</style>
