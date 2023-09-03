<template>
    <div class="switch">
        <v-switch :model-value="state" @update:modelValue="onChange($event as unknown as boolean)" />
    </div>
</template>

<script setup lang="ts">
import Fixture from '@/models/Fixture';
import DMXCommand from '@/models/DMXCommand';
import { useDmxStore } from '@/stores/dmx';
import { computed } from 'vue';

const store = useDmxStore();
const props = defineProps<{
    fixture: Fixture | undefined,
    channel: number | undefined,
    onVal: number | undefined,
    offVal: number | undefined
}>();

const state = computed(() => {
    if (props.fixture === undefined || props.channel === undefined || props.onVal === undefined || props.offVal === undefined) {
        return false;
    }
    return props.fixture.getDMXData(props.channel) === props.onVal;
});

function onChange(val: boolean): void {
    if (props.channel === undefined || props.onVal === undefined || props.offVal === undefined || props.fixture === undefined) {
        return;
    }
    props.fixture.applyCommands([
        new DMXCommand(props.channel, val ? props.onVal : props.offVal),
    ]);
    store.sendDMXData();
}
</script>

<style scoped></style>
