<template>
    <div class="home">
        <div v-for="group in groups" :key="group.name">
            <p>{{ group.name }}</p>
            <p>{{ group.members }}</p>
            <SceneSelector :target="group" :scenes="scenes" />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import SceneSelector from '@/components/SceneSelector.vue'
import Scene from "@/models/Scene";
import Group from '@/models/Group';
import Fixture from '@/models/Fixture';
import DMXCommand from '@/models/DMXCommand';

@Component({
    components: {
        SceneSelector
    }
})
export default class Home extends Vue {
    private groups: Group[] = []; 

    private scenes: Scene[] = [];
    mounted() {
        this.scenes.push(new Scene("Off"),
            new Scene("Colorloop"),
            new Scene("Strobe"),
            new Scene("Red"));

        var g1 = new Group("Strahler");
        var g2 = new Group("Außen");
        var f1 = new Fixture("Strahler1", 0);
        var f2 = new Fixture("Strahler2", 50);
        f1.setSceneConfig(this.scenes[2], new DMXCommand(6, 255));
        f2.setSceneConfig(this.scenes[2], new DMXCommand(6, 255));
        f1.setSceneConfig(this.scenes[3], new DMXCommand(1, 255));
        f2.setSceneConfig(this.scenes[3], new DMXCommand(1, 255));
        g1.members.push(f1)
        g1.members.push(f2);
        g2.members.push(f2);
        this.groups.push(g1);
        this.groups.push(g2);
    }
}
</script>
