<template>
    <div class="settings">
        <v-tabs v-model="tab" bg-color="primary">
            <v-tab value="scenes">Scenes</v-tab>
            <v-tab value="fixtures">Fixtures</v-tab>
            <v-tab value="config">Config</v-tab>
        </v-tabs>

        <v-window v-model="tab">
            <v-window-item value="scenes">
                <Scenes />
            </v-window-item>

            <v-window-item value="fixtures">
                <Fixtures />
            </v-window-item>

            <v-window-item value="config">
                <v-sheet class="ma-4 pa-4" elevation="2">
                    <h2>WiFi-Mode</h2>
                    <v-radio-group v-model="store.config.wifiMode">
                        <v-radio label="Access-Point" :value="WiFiMode.AccessPoint" :true-icon="mdiRadioboxMarked" :false-icon="mdiRadioboxBlank"></v-radio>
                        <v-radio label="Client" :value="WiFiMode.Station" :true-icon="mdiRadioboxMarked" :false-icon="mdiRadioboxBlank"></v-radio>
                    </v-radio-group>
                    <div v-if="store.config.wifiMode === WiFiMode.AccessPoint">
                        <v-text-field v-model="store.config.apSSID" placeholder="SSID" />
                    </div>
                    <div v-if="store.config.wifiMode === WiFiMode.Station">
                        <v-text-field v-model="store.config.wifiCredentials.ssid" placeholder="SSID" />
                        <v-text-field v-model="store.config.wifiCredentials.password" placeholder="Password" />
                    </div>
                </v-sheet>
                <v-sheet class="ma-4 pa-4" elevation="2">
                    <h2>Startup</h2>
                    <v-select v-model="store.config.startupScene" label="Startup Scene" :items="store.scenes"
                        item-title="name" />
                </v-sheet>
                <v-sheet class="ma-4 pa-4" elevation="2">
                    <h2>Transport</h2>
                    <v-switch v-model="store.config.useWebsockets" label="Use WebSockets" />
                </v-sheet>
                <v-btn class="mx-4 my-2" color="primary" @click="persistState()">Save</v-btn>
            </v-window-item>
        </v-window>
        <v-snackbar v-model="snackbar" timeout="2000">
            {{ snackbarText }}

            <template v-slot:action="{ attrs }">
                <v-btn color="pink" text v-bind="attrs" @click="snackbar = false">
                    Close
                </v-btn>
            </template>
        </v-snackbar>
    </div>
</template>

<script setup lang="ts">
import Scenes from '@/components/Config/Scenes.vue'
import Fixtures from '@/components/Config/Fixtures.vue'
import { ref, type Ref } from 'vue'
import { useDmxStore } from '@/stores/dmx'
import { WiFiMode } from '@/models/WiFiMode'
import { mdiRadioboxBlank, mdiRadioboxMarked } from '@mdi/js'

const store = useDmxStore();

let tab: any = ref(3);
let snackbar = ref(false);
let snackbarText = ref("Settings saved");

function persistState() {
    store.persistState().then(() => {
        snackbar.value = true;
    });
}
</script>

<style scoped>
#tabs {
    width: unset;
}
</style>