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
    </v-app>
</template>

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
