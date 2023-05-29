import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'vuetify/styles'
// @ts-ignore
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import WSService from './services/WSService'
import { useDmxStore } from './stores/dmx'

const app = createApp(App)
const pinia = createPinia()
const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi,
        },
    },
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