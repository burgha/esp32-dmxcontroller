<template>
    <div class="d-flex">
        <Button 
            v-for="scene in scenes"
            :key="scene.name"
            :title="scene.name"
            :active="activeScene === scene"
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

    mounted() {
        this.activeScene = this.$store.state.activeScene.get(this.target);
    }

    changeScene(newScene: Scene): void {
        this.target?.activateScene(newScene);
        this.activeScene = newScene;
        this.$store.commit('setActiveScene', {target: this.target, scene: newScene});
        this.$store.dispatch('sendDMXData');
    }
}
</script>

<style scoped>

</style>
