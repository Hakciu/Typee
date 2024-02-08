import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { library } from '@fortawesome/fontawesome-svg-core'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faRankingStar,
  faCircleInfo,
  faUser,
  faEnvelope,
  faCode,
  faUserPlus,
  faRightToBracket,
  faPaperPlane,
  faRotateRight,
  faGear,
} from '@fortawesome/free-solid-svg-icons'

import { faDiscord } from '@fortawesome/free-brands-svg-icons'

library.add(
  faRankingStar,
  faCircleInfo,
  faUser,
  faEnvelope,
  faCode,
  faUserPlus,
  faRightToBracket,
  faPaperPlane,
  faRotateRight,
  faGear,
  faDiscord
)

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)
app.use(createPinia())
app.use(router)

app.mount('#app')
