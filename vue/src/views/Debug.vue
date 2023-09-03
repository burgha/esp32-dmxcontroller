<template>
    <div class="debug">
        <v-sheet class="ma-4 pa-4" elevation="2">
            <h2>Manual DMX Commands</h2>
            <v-select v-model="selectedFixture" :items="store.fixtures" item-title="name" :return-object="true"
                label="Fixture" class="ma-2" outlined />
            <div v-if="selectedFixture" class="faderlist d-flex justify-center">
                <div v-for="index in selectedFixture.numChannels" :key="index" class="fader">
                    {{ index }}
                    <v-slider v-model="store.dmxData[selectedFixture.getAbsoluteChannel(index)]" direction="vertical" min="0" max="255" step="1"
                        class="ma-8" @end="changeDMXValue(index, $event)" />
                    {{ store.dmxData[selectedFixture.getAbsoluteChannel(index)] }}
                </div>
            </div>
        </v-sheet>

        <v-sheet class="ma-4 pa-4" elevation="2">
            <h2>Device</h2>
            <v-btn class="ma-2" @click="resetSettings()">Reset Settings</v-btn>
            <v-btn class="ma-2" @click="reboot()">Reboot</v-btn>
        </v-sheet>

        <v-sheet class="ma-4 pa-4" elevation="2">
            <h2>Settings</h2>
            <v-btn class="ma-2" @click="exportSettings()">Export Settings</v-btn>
            <v-file-input v-model="selectedFile" />
            <v-btn class="ma-2" @click="importSettings()">Import Settings</v-btn>
        </v-sheet>
    </div>
</template>

<script setup lang="ts">
import DMXCommand from '@/models/DMXCommand';
import Fixture from '@/models/Fixture';
import { useDmxStore } from '@/stores/dmx';
import { onMounted, ref } from 'vue';

const store = useDmxStore();
let selectedFixture = ref<Fixture | null>(null);
let selectedFile = ref<File[] | undefined>();

onMounted(() => {
    store.getDMXData();
});

function changeDMXValue(channel: number, value: string | number): void {
    if (selectedFixture === null) {
        return;
    }
    value = typeof value === 'string' ? parseInt(value) : value
    selectedFixture.value?.applyDMXCommand(new DMXCommand(channel, value));
    store.sendDMXData();
}

function resetSettings(): void {
    fetch(import.meta.env.VITE_APP_API_URL + '/clearSettings', { method: "POST" });
}

function reboot(): void {
    fetch(import.meta.env.VITE_APP_API_URL + '/reboot', { method: "POST" });
}

async function exportSettings(): Promise<void> {
    var fileURL = window.URL.createObjectURL(new Blob([await store.convertStateToJson()]));
    var fileLink = document.createElement('a');

    fileLink.href = fileURL;
    fileLink.setAttribute('download', 'settings.json');
    document.body.appendChild(fileLink);

    fileLink.click();
    document.body.removeChild(fileLink);
}

function importSettings(): void {
    if (selectedFile.value) {
        var reader = new FileReader();
        reader.readAsText(selectedFile.value[0], 'UTF-8');
        reader.onload = (evt) => {
            const json = evt.target?.result?.toString() ?? '';
            store.importJson(json);
            store.persistState();
        }
        reader.onerror = function () { }
    } else {
        //(this.$root.$children[0] as any).showSnackbar('No file selected');
    }
}
</script>