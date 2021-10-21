<template>
    <v-app>
        <v-main>
            <router-view />
            <div style="height: 60px; width: 100%" />
        </v-main>

        <v-bottom-navigation id="nav">
            <v-btn x-large to="/">
                <span>Home</span>
                <v-icon>mdi-home</v-icon>
            </v-btn>
            <v-btn x-large to="/settings">
                <span>Settings</span>
                <v-icon>mdi-cog</v-icon>
            </v-btn>
            <v-btn x-large to="/debug">
                <span>Debug</span>
                <v-icon>mdi-tune</v-icon>
            </v-btn>
        </v-bottom-navigation>

        <v-snackbar v-model="snackbar" timeout="2000">
            {{ snackbarText }}

            <template v-slot:action="{ attrs }">
                <v-btn
                    color="pink"
                    text
                    v-bind="attrs"
                    @click="snackbar = false"
                >
                    Close
                </v-btn>
            </template>
        </v-snackbar>
    </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({})
export default class App extends Vue {
    snackbar = false;
    snackbarText = '';

    public showSnackbar(text: string) {
        this.snackbarText = text;
        this.snackbar = true;
    }
}
</script>


<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    background: white;
}

#nav {
    position: fixed;
    overflow-x: scroll;
    overflow-y: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

#nav::-webkit-scrollbar {
    display: none;
}

#nav a.router-link-exact-active {
    color: #42b983;
}

#nav .v-btn {
    background-color: white;
}
</style>
