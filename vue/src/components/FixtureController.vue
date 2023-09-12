<template>
    <div v-if="control.type === FixtureControlType.Slider">
        <SliderFixtureControl 
            :fixture="target"
            :channels="control.config.trim().split(',').map(e => parseInt(e))"
            @value-changed="(data) => $emit('valueChanged', data)"
        />
    </div>
    <div v-if="control.type === FixtureControlType.Colorpicker">
        <ColorpickerFixtureControl 
            :fixture="target"
            :channels="control.config.trim().split(',').map(e => parseInt(e))"
            @value-changed="(data) => $emit('valueChanged', data)"
        />
    </div>
    <div v-if="control.type === FixtureControlType.Switch">
        <SwitchFixtureControl :fixture="target"
            :channel="parseInt(control.config.trim().split(',')[0])"
            :on-val="parseInt(control.config.trim().split(',')[1])"
            :off-val="parseInt(control.config.trim().split(',')[2])"
            @value-changed="(data) => $emit('valueChanged', data)"
        />
    </div>
</template>

<script setup lang="ts">
import type Fixture from '@/models/Fixture';
import type FixtureControl from '@/models/FixtureControl';
import { FixtureControlType } from '@/models/FixtureControl';
import SliderFixtureControl from "@/components/FixtureControls/Slider.vue";
import ColorpickerFixtureControl from "@/components/FixtureControls/Colorpicker.vue";
import SwitchFixtureControl from "@/components/FixtureControls/Switch.vue";
import type { FixtureControlValueChangedEventArgs } from '@/models/FixtureControlValueChangedEventArgs';

const props = defineProps<{
    target: Fixture,
    control: FixtureControl
}>();

const emit = defineEmits<{
    valueChanged: [args: FixtureControlValueChangedEventArgs]
}>();
</script>

<style scoped></style>
