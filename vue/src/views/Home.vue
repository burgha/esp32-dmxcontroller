<template>
    <div class="home">
        <div v-for="group in groups" :key="group.name">
            <p>{{ group.name }}</p>
            <p>{{ group.members.map(x => x.name).join(', ') }}</p>
            <SceneSelector :target="group" :scenes="scenes" />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import SceneSelector from '@/components/SceneSelector.vue'
import Group from '@/models/Group';
import Scene from '@/models/Scene';
import Fixture from '@/models/Fixture';

@Component({
    components: {
        SceneSelector
    }
})
export default class Home extends Vue {

    get scenes(): Scene[] {
        return this.$store.state.scenes; 
    }

    get groups(): Group[] {
        return this.$store.state.groups; 
    }

    get fixtures(): Fixture[] {
        return this.$store.state.fixtures; 
    }

    mounted() {
    }
}
</script>
