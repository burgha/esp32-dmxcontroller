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
                    <v-btn class="ma-2" @click="save()">Save</v-btn>
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
import Scenes from '@/components/Scenes.vue'
import Groups from '@/components/Groups.vue'
import Fixtures from '@/components/Fixtures.vue'

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

    mounted(): void {
        this.credentials = this.config.wifiCredentials;
    }

    get config(): Config {
        return this.$store.state.config;
    }

    public save(): void {
        this.config.wifiCredentials.ssid = this.credentials.ssid;
        this.config.wifiCredentials.password = this.credentials.password;
        this.$store.dispatch('persistState');
    }
}
</script>

<style scoped>
    #tabs {
        width: unset;
    }
</style>