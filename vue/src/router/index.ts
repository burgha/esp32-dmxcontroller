import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue'
import Scenes from '../components/Scenes.vue'
import Groups from '../components/Groups.vue'
import Fixtures from '../components/Fixtures.vue'
import Settings from '../views/Settings.vue'
import Debug from '../views/Debug.vue'
import store from '../store'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
    {
        path: '/',
        name: 'Home',
        beforeEnter: (to, from, next) => {
            store.commit('setDMXEnabled', true);
            next();
        },
        component: Home
    },
    {
        path: '/settings',
        name: 'Settings',
        beforeEnter: (to, from, next) => {
            store.commit('setDMXEnabled', false);
            next();
        },
        component: Settings
    },
    {
        path: '/debug',
        name: 'Debug',
        beforeEnter: (to, from, next) => {
            store.commit('setDMXEnabled', true);
            next();
        },
        component: Debug
    }
]

const router = new VueRouter({
    routes
})

export default router
