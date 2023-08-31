import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Home from '@/views/Home.vue';
import Groups from '@/views/Groups.vue';
import Settings from '@/views/Settings.vue';
import Debug from '@/views/Debug.vue';
import { useDmxStore } from '@/stores/dmx';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Home',
        beforeEnter: (to, from, next) => {
            const store = useDmxStore();
            store.setDMXEnabled(true);
            next();
        },
        component: Home
    },
    {
        path: '/groups',
        name: 'Groups',
        beforeEnter: (to, from, next) => {
            const store = useDmxStore();
            store.setDMXEnabled(true);
            next();
        },
        component: Groups
    },
    {
        path: '/settings',
        name: 'Settings',
        beforeEnter: (to, from, next) => {
            const store = useDmxStore();
            store.setDMXEnabled(false);
            next();
        },
        component: Settings
    },
    {
        path: '/debug',
        name: 'Debug',
        beforeEnter: (to, from, next) => {
            const store = useDmxStore();
            store.setDMXEnabled(true);
            next();
        },
        component: Debug
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes
})

export default router
