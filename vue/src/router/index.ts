import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue'
import Scenes from '../views/Scenes.vue'
import Groups from '../views/Groups.vue'
import Fixtures from '../views/Fixtures.vue'
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
        path: '/scenes',
        name: 'Scenes',
        beforeEnter: (to, from, next) => {
            store.commit('setDMXEnabled', false);
            next();
        },
        component: Scenes
    },
    {
        path: '/groups',
        name: 'Groups',
        beforeEnter: (to, from, next) => {
            store.commit('setDMXEnabled', false);
            next();
        },
        component: Groups
    },
    {
        path: '/fixtures',
        name: 'Fixtures',
        beforeEnter: (to, from, next) => {
            store.commit('setDMXEnabled', false);
            next();
        },
        component: Fixtures
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
