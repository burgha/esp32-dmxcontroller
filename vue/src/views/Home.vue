<template>
    <div class="home">
        <h1>Home</h1>
        <div class="ma-4">
            <v-switch
                class=""
                label="Enable DMX"
                :input-value="dmxEnabled"
                @change="onChangeDMXEnabled($event)"
            />
        </div>
        <v-card 
            v-for="group in groups" 
            :key="group.name"
            elevation="2"
            class="ma-4"
        >
            <p>{{ group.name }}</p>
            <p>Members: {{ group.members.map(x => x.name).join(', ') }}</p>
            <SceneSelector :target="group" :scenes="scenes" />
        </v-card>
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
    get dmxEnabled(): boolean {
        return this.$store.state.dmxEnabled; 
    }

    onChangeDMXEnabled(e: boolean): void {
        if (e) {
            this.$store.commit('setDMXEnabled', true);
        } else {
            this.$store.commit('setDMXEnabled', false);
        }
    }
}
</script>