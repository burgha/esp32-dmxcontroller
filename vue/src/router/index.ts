import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue'
import Scenes from '../views/Scenes.vue'
import Groups from '../views/Groups.vue'
import Fixtures from '../views/Fixtures.vue'
import Debug from '../views/Debug.vue'

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
        component: Scenes
    },
    {
        path: '/groups',
        name: 'Groups',
        component: Groups
    },
    {
        path: '/fixtures',
        name: 'Fixtures',
        component: Fixtures
    },
    {
        path: '/debug',
        name: 'Debug',
        component: Debug
    }
]

const router = new VueRouter({
    routes
})

export default router
