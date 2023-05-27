import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
// @ts-ignore
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import WSService from './services/WSService'
import { useDmxStore } from './stores/dmx'

const app = createApp(App)
const pinia = createPinia()
const vuetify = createVuetify({
    components,
    directives,
  })

app.use(pinia);
app.use(vuetify);
app.use(router);

app.mount('#app');

if (import.meta.env.VITE_APP_WS_URL) {
    const wsUrl = import.meta.env.VITE_APP_WS_URL.startsWith('/') ? `ws://${location.host}` + import.meta.env.VITE_APP_WS_URL : import.meta.env.VITE_APP_WS_URL;
    WSService.createInstance(wsUrl);
}

const store = useDmxStore();
store.loadSettings();