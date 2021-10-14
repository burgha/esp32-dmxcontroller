<template>
    <div class="switch">
        <v-switch v-model="state" @change="onChange($event)" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import Fixture from '@/models/Fixture';
import DMXCommand from '@/models/DMXCommand';

@Component
export default class SwitchFixtureControl extends Vue {
    @Prop(Fixture) fixture: Fixture | undefined
    @Prop(Number) channel: number | undefined
    @Prop(Number) onVal: number | undefined
    @Prop(Number) offVal: number | undefined

    private state: boolean = false;

    onChange(val: boolean): void {
        if (this.channel === undefined || this.onVal === undefined || this.offVal === undefined || this.fixture === undefined) {
            return;
        }
        this.fixture.activateCommands([
            new DMXCommand(this.fixture.getAbsoluteChannel(this.channel), val ? this.onVal : this.offVal),
        ]);
        this.$store.dispatch('sendDMXData');
    }
}
</script>

<style scoped>
</style>
