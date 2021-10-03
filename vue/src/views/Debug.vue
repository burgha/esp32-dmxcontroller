<template>
    <div class="debug">
        <h1>Debug</h1>

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

        <h2>Device</h2>
        <v-btn @click="resetSettings()">Reset Settings</v-btn>
    </div>
</template>

<script lang="ts">
import Fixture from '@/models/Fixture';
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
    components: {
    }
})
export default class Debug extends Vue {
    private selectedFixture: Fixture | null = null;

    get fixtures(): Fixture[] {
        return this.$store.state.fixtures; 
    }

    get dmxData(): Number[] {
        return this.$store.state.dmxData; 
    }

    changeDMXValue(channel: number, value: string | number): void {
        if (this.selectedFixture === null) {
            return;
        }
        this.selectedFixture.sendDMXCommand(this.selectedFixture.getAbsoluteChannel(channel), typeof value === 'string' ? parseInt(value) : value);
        this.$store.dispatch('persistState');
    }

    resetSettings(): void {
        fetch(process.env.VUE_APP_API_URL + '/clearSettings', {method: "POST"});
    }
}
</script>