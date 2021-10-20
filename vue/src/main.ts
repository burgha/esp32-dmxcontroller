import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import WSService from './services/WSService'

Vue.config.productionTip = false

store.dispatch('loadSettings');

new Vue({
    router,
    store,
    vuetify,
    render: h => h(App)
}).$mount('#app')

const wsUrl = process.env.VUE_APP_WS_URL.startsWith('/') ? `ws://${location.host}` + process.env.VUE_APP_WS_URL : process.env.VUE_APP_WS_URL;
WSService.createInstance(wsUrl);