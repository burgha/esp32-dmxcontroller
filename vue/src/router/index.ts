import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/scenes',
        name: 'Scenes',
        component: () => import(/* webpackChunkName: "about" */ '../views/Scenes.vue')
    },
    {
        path: '/groups',
        name: 'Groups',
        component: () => import(/* webpackChunkName: "about" */ '../views/Groups.vue')
    },
    {
        path: '/fixtures',
        name: 'Fixtures',
        component: () => import(/* webpackChunkName: "about" */ '../views/Fixtures.vue')
    }
]

const router = new VueRouter({
    routes
})

export default router
