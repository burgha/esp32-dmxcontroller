<template>
  <v-app>
    <v-main>
      <RouterView />
      <div style="height: 60px; width: 100%" />
    </v-main>

    <v-bottom-navigation id="nav">
      <v-btn x-large to="/">
        <span>Home</span>
        <v-icon :icon="mdiHome"></v-icon>
      </v-btn>
      <v-btn x-large to="/settings">
        <span>Settings</span>
        <v-icon :icon="mdiCog"></v-icon>
      </v-btn>
      <v-btn x-large to="/debug">
        <span>Debug</span>
        <v-icon :icon="mdiTune"></v-icon>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { mdiHome, mdiCog, mdiTune } from '@mdi/js'
</script>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
