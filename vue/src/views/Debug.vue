<template>
    <div class="home">
        <h1>Debug</h1>

        <select v-model="selectedFixture">
            <option v-for="fixture in fixtures" :key="fixture.name" :value="fixture">{{fixture.name}}</option>
        </select>

        <div v-if="selectedFixture">
            <div v-for="index in selectedFixture.numChannels" :key="index">
                {{index}}<input type="range" min="0" max="255" v-model="dmxData[selectedFixture.getAbsoluteChannel(index)]" @change="changeDMXValue(index, $event.target.value)">{{dmxData[selectedFixture.getAbsoluteChannel(index)]}}<br>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
//import DMXCommand from '@/models/DMXCommand';
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
    }
}
</script>
