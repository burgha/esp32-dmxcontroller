import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import Scene from './models/Scene'
import Group from './models/Group'
import Fixture from './models/Fixture'
import DMXCommand from './models/DMXCommand'

Vue.config.productionTip = false

store.dispatch('loadSettings');

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')