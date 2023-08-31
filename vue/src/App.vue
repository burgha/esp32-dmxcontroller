<template>
  <v-app>
    
    <v-main>
      <div v-if="errorDuringLoading" class="d-flex justify-center align-center flex-column" style="height: 100%;">
        <v-icon :icon="mdiAlert" size="92"></v-icon>
        <p>Could not connect to Controller</p>
      </div>
      <div v-else-if="!settingsLoaded" class="d-flex justify-center align-center" style="height: 100%;">
        <v-progress-circular indeterminate :size="92"></v-progress-circular>
      </div>
      <div v-else="settingsLoaded">
        <RouterView />
      </div>
    </v-main>

    <v-bottom-navigation id="nav">
      <v-btn x-large to="/">
        <span>Home</span>
        <v-icon :icon="mdiHome"></v-icon>
      </v-btn>
      <v-btn x-large to="/groups">
        <span>Groups</span>
        <v-icon :icon="mdiCog"></v-icon>
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
import { mdiHome, mdiCog, mdiTune, mdiAlert } from '@mdi/js'
import { ref } from 'vue';
import { useDmxStore } from './stores/dmx';

let settingsLoaded = ref(false);
let errorDuringLoading = ref(false);

const store = useDmxStore();
store.loadSettings().then(() => {
  settingsLoaded.value = true;
}).catch(() => {
  errorDuringLoading.value = true;
});
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
