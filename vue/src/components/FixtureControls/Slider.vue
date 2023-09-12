<template>
    <div class="slider">
        <v-slider min="0" max="255" step="1" :thumb-label="true" :model-value="color" @end="onChange($event)" />
    </div>
</template>

<script setup lang="ts">
import Fixture from '@/models/Fixture';
import DMXCommand from '@/models/DMXCommand';
import { useDmxStore } from '@/stores/dmx';
import { computed } from 'vue';
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
    if (props.channels === undefined || props.channels.length === 0 || props.fixture === undefined) {
        return 0;
    }
    return props.fixture.getDMXData(props.channels[0]);
});

function onChange(val: number): void {
    if (props.channels === undefined || props.channels.length === 0 || props.fixture === undefined) {
        return;
    }
    const commands = props.channels.map(c => new DMXCommand(c, val));
    props.fixture.applyCommands(commands);
    emit('valueChanged', {
        commands: commands
    });
    store.sendDMXData();
}
</script>

<style scoped></style>
