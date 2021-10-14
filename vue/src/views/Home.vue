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

        <h2>Scenes</h2>
        <v-card 
            v-for="group in groups" 
            :key="group.name"
            elevation="2"
            class="ma-4 pa-4"
        >
            <h3>{{ group.name }}</h3>
            <p>Members: {{ group.members.map(x => x.name).join(', ') }}</p>
            <SceneSelector :target="group" :scenes="scenes" />
        </v-card>

        <h2>Fixtures</h2>
        <div v-for="fixture in fixtures" :key="fixture.name">
            <v-card 
                v-if="fixture.controls && fixture.controls.length > 0"
                elevation="2"
                class="ma-4 pa-4"
            >
                <h3>{{ fixture.name }}</h3>
                <div v-for="control in fixture.controls" :key="control.name" class="ma-4 text-left">
                    <h5 class="mb-4">{{ control.name }}</h5>
                    <div v-if="control.type === FixtureControlType.Slider">
                        <SliderFixtureControl :fixture="fixture" :channels="control.config.trim().split(',').map(e => parseInt(e))" />
                    </div>
                    <div v-if="control.type === FixtureControlType.Colorpicker">
                        <ColorpickerFixtureControl :fixture="fixture" :channels="control.config.trim().split(',').map(e => parseInt(e))" />
                    </div>
                    <div v-if="control.type === FixtureControlType.Switch">
                        <SwitchFixtureControl
                            :fixture="fixture" 
                            :channel="parseInt(control.config.trim().split(',')[0])"
                            :on-val="parseInt(control.config.trim().split(',')[1])"
                            :off-val="parseInt(control.config.trim().split(',')[2])"
                        />
                    </div>
                </div>
            </v-card>
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
import { FixtureControlType } from '@/models/FixtureControl';
import SliderFixtureControl from '@/components/FixtureControls/Slider.vue';
import ColorpickerFixtureControl from '@/components/FixtureControls/Colorpicker.vue';
import SwitchFixtureControl from '@/components/FixtureControls/Switch.vue';

@Component({
    components: {
        SceneSelector,
        SliderFixtureControl,
        ColorpickerFixtureControl,
        SwitchFixtureControl
    }
})
export default class Home extends Vue {
    private FixtureControlType = FixtureControlType;

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