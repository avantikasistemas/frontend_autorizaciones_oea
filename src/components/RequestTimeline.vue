<script setup>
defineProps({
  request: {
    type: Object,
    default: null
  }
})

const formatDate = (date) => {
  if (!date) return 'Pendiente'
  return new Date(date).toLocaleString('es-CO')
}

const getApplications = (request) =>
  request?.applications?.length ? request.applications.join(', ') : request?.application || ''

const getApprovedApplications = (request) =>
  request?.approvedApplications?.length ? request.approvedApplications.join(', ') : getApplications(request)

const getApprovalSummary = (request) => {
  if (!request?.approvedAt) return ''
  if (request.status === 'Aprobado parcial por Gerencia') {
    return `Aprobadas: ${getApprovedApplications(request)}`
  }
  return `Aprobado TOTAL: ${getApprovedApplications(request)}`
}
</script>

<template>
  <section class="card">
    <p class="section-label">Trazabilidad</p>
    <h2>Seguimiento de autorización</h2>

    <div v-if="!request" class="empty">
      Selecciona o crea una solicitud para visualizar su trazabilidad.
    </div>

    <div v-else class="timeline">
      <div class="step completed">
        <span class="dot"></span>
        <div>
          <strong>Solicitud enviada</strong>
          <p>{{ formatDate(request.createdAt) }}</p>
        </div>
      </div>

      <div class="step" :class="{ completed: request.approvedAt }">
        <span class="dot"></span>
        <div>
          <strong>{{ request.status === 'Aprobado parcial por Gerencia' ? 'Aprobación parcial Gerencia' : 'Aprobación Gerencia' }}</strong>
          <p>{{ formatDate(request.approvedAt) }}</p>
          <p v-if="getApprovalSummary(request)" class="detail">{{ getApprovalSummary(request) }}</p>
        </div>
      </div>

      <div v-if="request.rejectedAt" class="step rejected completed">
        <span class="dot"></span>
        <div>
          <strong>Rechazo Gerencia</strong>
          <p>{{ formatDate(request.rejectedAt) }}</p>
        </div>
      </div>

      <div v-if="!request.rejectedAt" class="step" :class="{ completed: request.activatedAt }">
        <span class="dot"></span>
        <div>
          <strong>Activación TIC</strong>
          <p>{{ formatDate(request.activatedAt) }}</p>
        </div>
      </div>

      <div class="audit">
        <h3>Registro de auditoría</h3>
        <article v-for="(item, index) in request.auditTrail" :key="index">
          <strong>{{ item.action }}</strong>
          <span>{{ item.responsible }} — {{ formatDate(item.date) }}</span>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.card {
  background: white;
  border: 1px solid #e4ebf2;
  border-radius: 26px;
  padding: 24px;
  box-shadow: 0 16px 40px rgba(28, 50, 84, 0.07);
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
  margin: 0 0 22px;
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

.timeline {
  position: relative;
  display: grid;
  gap: 18px;
}

.step {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  opacity: 0.55;
}

.step.completed {
  opacity: 1;
}

.dot {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #cdd7e1;
  margin-top: 2px;
  box-shadow: 0 0 0 6px #f1f4f7;
}

.step.completed .dot {
  background: #1c9b75;
  box-shadow: 0 0 0 6px #e8f7f1;
}

.step.rejected .dot {
  background: #b42318;
  box-shadow: 0 0 0 6px #fdecec;
}

.step strong {
  color: #243347;
  display: block;
  margin-bottom: 4px;
}

.step p {
  margin: 0;
  color: #697486;
  font-size: 13px;
}

.step .detail {
  margin-top: 5px;
  color: #243347;
  font-weight: 800;
}

.audit {
  margin-top: 10px;
  border-top: 1px solid #e7edf3;
  padding-top: 18px;
}

.audit h3 {
  margin: 0 0 12px;
  font-size: 16px;
  color: #243347;
}

.audit article {
  background: #f8fafc;
  border: 1px solid #e5ebf1;
  border-radius: 16px;
  padding: 13px;
  margin-bottom: 10px;
}

.audit article strong {
  display: block;
  font-size: 13px;
  color: #2e3c4e;
}

.audit article span {
  display: block;
  margin-top: 4px;
  color: #738092;
  font-size: 12px;
}
</style>
