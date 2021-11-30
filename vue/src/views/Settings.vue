<template>
    <div class="settings">
        <h1>Settings</h1>
        <v-tabs id="tabs" v-model="tab" class="mx-4" show-arrows centered>
            <v-tab>Scenes</v-tab>
            <v-tab>Groups</v-tab>
            <v-tab>Fixtures</v-tab>
            <v-tab>Config</v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
            <v-tab-item>
                <Scenes />
            </v-tab-item>
            <v-tab-item>
                <Groups />
            </v-tab-item>
            <v-tab-item>
                <Fixtures />
            </v-tab-item>
            <v-tab-item>
                <v-sheet class="ma-4 pa-4" elevation="2">
                    <h2>WiFi</h2>
                    <v-text-field v-model="credentials.ssid" placeholder="SSID" />
                    <v-text-field v-model="credentials.password" placeholder="Password" />
                    <v-btn class="ma-2" @click="saveWifiConfig()">Save</v-btn>
                </v-sheet>
                <v-sheet class="ma-4 pa-4" elevation="2">
                    <h2>Startup</h2>
                    <v-select v-model="startupScene" label="Startup Scene" :items="scenes" item-text="name" />
                    <v-btn class="ma-2" @click="saveStartupConfig()">Save</v-btn>
                </v-sheet>
                <v-sheet class="ma-4 pa-4" elevation="2">
                    <h2>Transport</h2>
                    <v-switch v-model="useWebsockets" label="Use WebSockets" />
                    <v-btn class="ma-2" @click="saveTransportConfig()">Save</v-btn>
                </v-sheet>
            </v-tab-item>
        </v-tabs-items>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import Config from '@/models/Config'
import WifiCredentials from '@/models/WifiCredentials';
import Scenes from '@/components/Config/Scenes.vue'
import Groups from '@/components/Config/Groups.vue'
import Fixtures from '@/components/Config/Fixtures.vue'
import Scene from '@/models/Scene';

@Component({
    components: {
        Scenes,
        Groups,
        Fixtures
    }
})
export default class Settings extends Vue {
    tab: any = null;
    credentials: WifiCredentials = new WifiCredentials('', '');
    startupScene: string|null = null;
    useWebsockets: boolean = true;

    mounted(): void {
        this.credentials = this.config.wifiCredentials;
        this.useWebsockets = this.config.useWebsockets;
        this.startupScene = this.config.startupScene;
    }

    get config(): Config {
        return this.$store.state.config;
    }

    get scenes(): Scene[] {
        return this.$store.state.scenes;
    }

    public saveWifiConfig(): void {
        this.config.wifiCredentials.ssid = this.credentials.ssid;
        this.config.wifiCredentials.password = this.credentials.password;
        this.$store.dispatch('persistState');
    }

    public saveStartupConfig(): void {
        if (this.startupScene === null) {
            return;
        }
        this.config.startupScene = this.startupScene;
        this.$store.dispatch('persistState');
    }

    public saveTransportConfig(): void {
        this.config.useWebsockets = this.useWebsockets;
        this.$store.dispatch('persistState');
    }
}
</script>

<style scoped>
    #tabs {
        width: unset;
    }
</style>