import { createApp } from 'vue'
import App from './App.vue'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faWhatsapp, faYoutube, faLinkedin } from '@fortawesome/free-brands-svg-icons'
import { faShieldHalved, faEnvelope, faCheck, faClock, faUserTie, faLockOpen } from '@fortawesome/free-solid-svg-icons'

library.add(
  faWhatsapp,
  faYoutube,
  faLinkedin,
  faShieldHalved,
  faEnvelope,
  faCheck,
  faClock,
  faUserTie,
  faLockOpen
)

const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')