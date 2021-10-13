<template>
    <div class="color-picker">
        <v-color-picker
            dot-size="25"
            swatches-max-height="200"
            @update:color="onUpdateColor($event)"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import Fixture from '@/models/Fixture';
import DMXCommand from '@/models/DMXCommand';

@Component
export default class ColorpickerFixtureControl extends Vue {
    @Prop(Fixture) fixture: Fixture | undefined
    @Prop(Array) channels: number[] | undefined;

    private changeLock = true;
    mounted() {
        this.changeLock = false;
    }

    onUpdateColor(val: any): void {
        // Todo: limit send rate or else esp crashes
        if (this.channels === undefined || this.fixture === undefined || this.changeLock) {
            return;
        }
        this.fixture.activateCommands([
            new DMXCommand(this.fixture.getAbsoluteChannel(this.channels[0]), val.rgba.r),
            new DMXCommand(this.fixture.getAbsoluteChannel(this.channels[1]), val.rgba.g),
            new DMXCommand(this.fixture.getAbsoluteChannel(this.channels[2]), val.rgba.b),
        ]);
        this.$store.dispatch('sendDMXData');
    }
}
</script>

<style scoped>
</style>
