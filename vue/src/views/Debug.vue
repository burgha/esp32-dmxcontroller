<template>
    <div class="debug">
        <h1>Debug</h1>

        <v-sheet class="ma-4 pa-4" elevation="2">
            <h2>Manual DMX Commands</h2>
            <v-select
                v-model="selectedFixture"
                :items="fixtures"
                item-text="name"
                :return-object="true"
                label="Fixture"
                class="ma-2"
                outlined
            />
            <div v-if="selectedFixture" class="faderlist d-flex justify-center">
                <div v-for="index in selectedFixture.numChannels" :key="index" class="fader">
                    {{ index }}
                    <v-slider v-model="dmxData[selectedFixture.getAbsoluteChannel(index)]" vertical min="0" max="255" class="ma-8" @change="changeDMXValue(index, $event)" />
                    {{ dmxData[selectedFixture.getAbsoluteChannel(index)] }}
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

<script lang="ts">
import DMXCommand from '@/models/DMXCommand';
import Fixture from '@/models/Fixture';
import Vue from 'vue'
import Component from 'vue-class-component'
import {convertStateToJson, importObjectIntoStore} from '@/store'

@Component({
    components: {
    }
})
export default class Debug extends Vue {
    private selectedFixture: Fixture | null = null;
    private selectedFile: File | null= null;

    get fixtures(): Fixture[] {
        return this.$store.state.fixtures; 
    }

    get dmxData(): Number[] {
        return this.$store.state.dmxData; 
    }

    mounted() {
        this.$store.dispatch('getDMXData');
    }

    changeDMXValue(channel: number, value: string | number): void {
        if (this.selectedFixture === null) {
            return;
        }
        value = typeof value === 'string' ? parseInt(value) : value
        this.selectedFixture.applyDMXCommand(new DMXCommand(channel, value));
        this.$store.dispatch('sendDMXData');
        this.$store.dispatch('persistState');
    }

    resetSettings(): void {
        fetch(process.env.VUE_APP_API_URL + '/clearSettings', {method: "POST"});
    }

    reboot(): void {
        fetch(process.env.VUE_APP_API_URL + '/reboot', {method: "POST"});
    }

    async exportSettings(): Promise<void> {
        var fileURL = window.URL.createObjectURL(new Blob([await convertStateToJson(this.$store.state)]));
        var fileLink = document.createElement('a');
    
        fileLink.href = fileURL;
        fileLink.setAttribute('download', 'settings.json');
        document.body.appendChild(fileLink);
    
        fileLink.click();
        document.body.removeChild(fileLink);
    }

    importSettings(): void {
        if (this.selectedFile) {
            var reader = new FileReader();
            reader.readAsText(this.selectedFile, 'UTF-8');
            const self = this;
            reader.onload = function(evt) {
                const json = evt.target?.result?.toString() ?? '';
                importObjectIntoStore(JSON.parse(json), self.$store);
                self.$store.dispatch('persistState');
            }
            reader.onerror = function() {}
        }
    }
}
</script>