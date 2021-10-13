<template>
    <div class="slider">
        <v-slider min="0" max="255" :thumb-label="true" @change="onChange($event)" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import Fixture from '@/models/Fixture';
import DMXCommand from '@/models/DMXCommand';

@Component
export default class SliderFixtureControl extends Vue {
    @Prop(Fixture) fixture: Fixture | undefined
    @Prop(Array) channels: number[] | undefined

    onChange(val: number): void {
        if (this.channels === undefined || this.fixture === undefined) {
            return;
        }
        this.fixture.activateCommands([
            new DMXCommand(this.fixture.getAbsoluteChannel(this.channels[0]), val),
        ]);
        this.$store.dispatch('sendDMXData');
    }
}
</script>

<style scoped>
</style>
