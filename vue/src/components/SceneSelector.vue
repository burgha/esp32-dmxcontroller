<template>
    <div>
        <Button 
            v-for="scene in scenes"
            :key="scene.name"
            :title="scene.name"
            :active="scene===activeScene"
            @click.native="changeScene(scene)"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'
import Button from '@/components/Button.vue'
import DMXControllable from '@/models/DMXControllable';
import Scene from '@/models/Scene';

@Component({
    components: {
        Button
    }
})
export default class SceneSelector extends Vue {
    @Prop(Object) target: DMXControllable | undefined;
    @Prop(Array) scenes: Scene[] | undefined;
    private activeScene: Scene | null = null;

    changeScene(newScene: Scene): void {
        this.activeScene = newScene;
        this.target?.activateScene(newScene);
        this.$store.dispatch('sendDMXData');
    }
}
</script>

<style scoped>

</style>
