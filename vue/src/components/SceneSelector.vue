<template>
    <div class="d-flex justify-center flex-wrap">
        <Button v-for="scene in scenes" :key="scene.name" :title="scene.name" :active="(store.activeScene.get(target) ?? null) === scene"
            @click.native="changeScene(scene)" />
    </div>
</template>

<script setup lang="ts">
import { useDmxStore } from '@/stores/dmx'
import Button from '@/components/Button.vue'
import type DMXControllable from '@/models/DMXControllable';
import Scene from '@/models/Scene';


const store = useDmxStore();
const props = defineProps<{
    target: DMXControllable,
    scenes: Scene[] | undefined;
}>();

function changeScene(newScene: Scene): void {
    props.target?.activateScene(newScene);
    store.activeScene.set(props.target, newScene);
    store.sendDMXData();
}
</script>

<style scoped></style>
