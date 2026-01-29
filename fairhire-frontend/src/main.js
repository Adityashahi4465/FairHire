import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import VueTippy from 'vue-tippy'
import 'tippy.js/dist/tippy.css'
import './style.css'

// ---------------- create app ----------------
const app = createApp(App)

app.use(VueTippy)
app.use(createPinia())
app.use(router)

app.mount('#app')
