<template>
    <div class="color-picker">
        <v-color-picker dot-size="25" swatches-max-height="200" :model-value="color" @update:modelValue="onUpdateColor($event)" />
    </div>
</template>

<script setup lang="ts">
import Fixture from '@/models/Fixture';
import DMXCommand from '@/models/DMXCommand';
import { computed, onMounted } from 'vue';
import { useDmxStore } from '@/stores/dmx';
import type { FixtureControlValueChangedEventArgs } from '@/models/FixtureControlValueChangedEventArgs';

const store = useDmxStore();
const props = defineProps<{
    fixture: Fixture | undefined,
    channels: number[] | undefined
}>();

const emit = defineEmits<{
    valueChanged: [args: FixtureControlValueChangedEventArgs]
}>();
const color = computed(() => {
    if (!props.channels) {
        return "#000"
    }
    return rgb2Hex(props.fixture?.getDMXData(props.channels[0]), props.fixture?.getDMXData(props.channels[1]), props.fixture?.getDMXData(props.channels[2]));
});

const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

const debouncedUpdate = debounce(store.sendDMXData, 100);

function rgb2Hex(r: number, g: number, b: number) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16)
        return hex.length === 1 ? '0' + hex : hex
    }).join('');
}

function hex2rgb(hex: string) {
    const red = parseInt(hex.substring(1, 3), 16);
    const green = parseInt(hex.substring(3, 5), 16);
    const blue = parseInt(hex.substring(5, 7), 16);

    return [red, green, blue];
}

function onUpdateColor(val: any): void {
    val = hex2rgb(val);
    if (props.channels === undefined || props.fixture === undefined) {
        return;
    }
    const commands = [
        new DMXCommand(props.channels[0], val[0]),
        new DMXCommand(props.channels[1], val[1]),
        new DMXCommand(props.channels[2], val[2]),
    ];
    props.fixture.applyCommands(commands);
    emit('valueChanged', {
        commands: commands
    });
    debouncedUpdate();
}
</script>

<style scoped>
</style>