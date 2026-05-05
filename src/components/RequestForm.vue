<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  isSubmitting: {
    type: Boolean,
    default: false
  },
  currentUser: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit-request'])

const form = reactive({
  requesterName: '',
  collaboratorName: '',
  area: '',
  applications: ['WhatsApp'],
  reason: '',
  businessValue: '',
  managerName: 'Ivan Antequera',
  managerEmail: 'tic@avantika.com.co',
  copyEmail: ''
})

const getNameFromEmail = (email = '') =>
  email
    .split('@')[0]
    ?.replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase()) || ''

watch(
  () => props.currentUser,
  (user) => {
    if (!user) return
    if (!form.requesterName) {
      form.requesterName = user.name && user.name !== 'Development User'
        ? user.name
        : getNameFromEmail(user.email)
    }
  },
  { immediate: true }
)

const macroprocesses = [
  'ABASTECIMIENTO',
  'CAPITAL HUMANO',
  'DIRECCIONAMIENTO ESTRATÉGICO',
  'GESTIÓN DE COTIZACIONES',
  'GESTIÓN FINANCIERA',
  'INFRAESTRUCTURA',
  'LOGÍSTICA',
  'MERCADEO',
  'PRESTACIÓN DEL SERVICIO TÉCNICO',
  'SERVICIO AL CLIENTE',
  'SIG',
  'TIC',
  'VENTAS'
]

const applications = [
  {
    name: 'WhatsApp',
    className: 'whatsapp',
    icon: ['fab', 'whatsapp'],
    description: 'Uso autorizado para comunicación laboral con clientes o proveedores.'
  },
  {
    name: 'YouTube',
    className: 'youtube',
    icon: ['fab', 'youtube'],
    description: 'Uso autorizado para capacitaciones, soporte técnico o contenido corporativo.'
  },
  {
    name: 'LinkedIn',
    className: 'linkedin',
    icon: ['fab', 'linkedin'],
    description: 'Uso autorizado para gestión comercial, talento humano o relacionamiento empresarial.'
  }
]

const toggleApplication = (application) => {
  if (form.applications.includes(application)) {
    form.applications = form.applications.filter(item => item !== application)
    return
  }

  form.applications.push(application)
}

const submit = () => {
  if (props.isSubmitting) return

  if (
    !form.requesterName ||
    !form.collaboratorName ||
    !form.area ||
    !form.reason ||
    !form.businessValue ||
    !form.managerEmail ||
    form.applications.length === 0
  ) {
    alert('Por favor completa los campos obligatorios.')
    return
  }

  emit('submit-request', { ...form })
}
</script>

<template>
  <section class="card">
    <div class="card-header">
      <div>
        <p class="section-label">Nueva solicitud</p>
        <h2>Solicitar habilitación</h2>
      </div>
      <font-awesome-icon icon="fa-solid fa-lock-open" class="header-icon" />
    </div>

    <div class="apps">
      <button
        v-for="app in applications"
        :key="app.name"
        class="app-option"
        :class="[app.className, { active: form.applications.includes(app.name) }]"
        @click="toggleApplication(app.name)"
        type="button"
      >
        <span class="checkmark">
          <font-awesome-icon v-if="form.applications.includes(app.name)" icon="fa-solid fa-check" />
        </span>
        <font-awesome-icon :icon="app.icon" />
        <strong>{{ app.name }}</strong>
        <small>{{ app.description }}</small>
      </button>
    </div>

    <form @submit.prevent="submit" class="form">
      <div class="grid">
        <label>
          Nombre del jefe inmediato *
          <input v-model="form.requesterName" type="text" placeholder="Nombre completo" readonly />
        </label>

        <label>
          Correo en copia
          <input v-model="form.copyEmail" type="email" placeholder="coordinador@avantika.com.co" />
        </label>
      </div>

      <div class="grid">
        <label>
          Nombre del colaborador *
          <input v-model="form.collaboratorName" type="text" placeholder="Nombre completo" />
        </label>
      </div>

      <label>
        Macroproceso *
        <select v-model="form.area">
          <option value="" disabled>Selecciona un macroproceso</option>
          <option v-for="macroprocess in macroprocesses" :key="macroprocess" :value="macroprocess">
            {{ macroprocess }}
          </option>
        </select>
      </label>

      <label>
        Motivo de la solicitud *
        <textarea
          v-model="form.reason"
          rows="5"
          placeholder="Describe por qué requiere la habilitación, para qué proceso se utilizará y durante cuánto tiempo aproximadamente."
        ></textarea>
      </label>

      <label>
        Alineación estratégica y aporte esperado *
        <textarea
          v-model="form.businessValue"
          rows="4"
          placeholder="Explica cómo esta habilitación apoya los objetivos del área, contribuye al cumplimiento de metas comerciales, facturación, pedidos, atención al cliente o eficiencia del proceso."
        ></textarea>
      </label>

      <div class="grid">
        <label>
          Quién aprueba
          <input v-model="form.managerName" type="text" readonly />
        </label>

        <label>
          Correo de quien aprueba *
          <input v-model="form.managerEmail" type="email" placeholder="tic@avantika.com.co" />
        </label>
      </div>

      <button class="submit-btn" type="submit" :disabled="props.isSubmitting">
        <font-awesome-icon
          :icon="props.isSubmitting ? 'fa-solid fa-spinner' : 'fa-solid fa-envelope'"
          :spin="props.isSubmitting"
        />
        {{ props.isSubmitting ? 'Enviando solicitud...' : 'Enviar solicitud' }}
      </button>
    </form>
  </section>
</template>

<style scoped>
.card {
  background: white;
  border: 1px solid #e4ebf2;
  border-radius: 26px;
  padding: 26px;
  box-shadow: 0 16px 40px rgba(28, 50, 84, 0.07);
}

.card-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
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
  color: #243347;
  font-size: 24px;
}

.header-icon {
  background: #eaf7f1;
  color: #1c9b75;
  padding: 16px;
  border-radius: 18px;
  font-size: 22px;
}

.apps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 22px;
}

.app-option {
  position: relative;
  border: 1px solid #e2e8ef;
  background: #fbfcfd;
  border-radius: 20px;
  padding: 18px 14px;
  text-align: left;
  cursor: pointer;
  transition: 0.25s ease;
  color: #384658;
}

.checkmark {
  position: absolute;
  top: 12px;
  right: 12px;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border: 1px solid #cbd5df;
  border-radius: 7px;
  background: white;
  color: #1c9b75;
  font-size: 12px;
}

.app-option svg {
  font-size: 26px;
  margin-bottom: 10px;
}

.checkmark svg {
  font-size: 12px;
  margin: 0;
}

.app-option strong {
  display: block;
  font-size: 15px;
  margin-bottom: 7px;
}

.app-option small {
  display: block;
  color: #6d7887;
  line-height: 1.35;
}

.app-option.active {
  border-color: #1c9b75;
  background: #effaf5;
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(28, 155, 117, 0.14);
}

.app-option.youtube.active {
  border-color: #ff0033;
  background: #fff1f3;
  box-shadow: 0 10px 24px rgba(255, 0, 51, 0.13);
}

.app-option.linkedin.active {
  border-color: #0a66c2;
  background: #eef6ff;
  box-shadow: 0 10px 24px rgba(10, 102, 194, 0.14);
}

.app-option.active .checkmark {
  border-color: #1c9b75;
  background: #1c9b75;
  color: white;
}

.app-option.whatsapp.active > svg,
.app-option.whatsapp.active strong {
  color: #1c9b75;
}

.app-option.youtube.active .checkmark {
  border-color: #ff0033;
  background: #ff0033;
}

.app-option.linkedin.active .checkmark {
  border-color: #0a66c2;
  background: #0a66c2;
}

.app-option.youtube.active > svg,
.app-option.youtube.active strong {
  color: #d6002b;
}

.app-option.linkedin.active > svg,
.app-option.linkedin.active strong {
  color: #0a66c2;
}

.form {
  display: grid;
  gap: 16px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

label {
  display: grid;
  gap: 8px;
  color: #4a5666;
  font-size: 13px;
  font-weight: 700;
}

input,
select,
textarea {
  border: 1px solid #dce4ec;
  border-radius: 16px;
  padding: 14px 15px;
  font-size: 14px;
  color: #283545;
  outline: none;
  background: #fcfdff;
  transition: 0.2s ease;
  font-family: inherit;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #1c9b75;
  box-shadow: 0 0 0 4px rgba(28, 155, 117, 0.12);
}

input[readonly] {
  background: #f4f7fa;
  color: #516070;
}

textarea {
  resize: vertical;
}

select {
  appearance: none;
  cursor: pointer;
}

.submit-btn {
  margin-top: 6px;
  border: none;
  background: linear-gradient(135deg, #173b57, #1c9b75);
  color: white;
  border-radius: 18px;
  padding: 15px 18px;
  font-weight: 800;
  cursor: pointer;
  font-size: 15px;
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  box-shadow: 0 14px 30px rgba(23, 59, 87, 0.22);
}

.submit-btn:disabled {
  cursor: wait;
  opacity: 0.76;
}

@media (max-width: 900px) {
  .apps,
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
