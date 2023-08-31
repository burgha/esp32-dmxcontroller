<template>
    <div class="home">
        <div class="ma-4">
            <v-switch class="" label="Enable DMX" v-model="store.dmxEnabled" @change="onChangeDMXEnabled()" />
        </div>

        <h2>Scenes</h2>
        <v-card v-for="group in store.groups" :key="group.name" elevation="2" class="ma-4 pa-4">
            <h3>{{ group.name }}</h3>
            <p>Members: {{ group.members.map(x => x.name).join(', ') }}</p>
            <SceneSelector :target="(group as Group)" :scenes="(store.scenes as Scene[])" />
        </v-card>

        <h2>Fixtures</h2>
        <div v-for="fixture in store.fixtures" :key="fixture.name">
            <v-card v-if="fixture.controls && fixture.controls.length > 0" elevation="2" class="ma-4 pa-4">
                <h3>{{ fixture.name }}</h3>
                <div v-for="control in fixture.controls" :key="control.name" class="ma-4 text-left">
                    <h5 class="mb-4">{{ control.name }}</h5>
                    <div v-if="control.type === FixtureControlType.Slider">
                        <SliderFixtureControl :fixture="(fixture as Fixture)"
                            :channels="control.config.trim().split(',').map(e => parseInt(e))" />
                    </div>
                    <div v-if="control.type === FixtureControlType.Colorpicker">
                        <ColorpickerFixtureControl :fixture="(fixture as Fixture)"
                            :channels="control.config.trim().split(',').map(e => parseInt(e))" />
                    </div>
                    <div v-if="control.type === FixtureControlType.Switch">
                        <SwitchFixtureControl :fixture="(fixture as Fixture)"
                            :channel="parseInt(control.config.trim().split(',')[0])"
                            :on-val="parseInt(control.config.trim().split(',')[1])"
                            :off-val="parseInt(control.config.trim().split(',')[2])" />
                    </div>
                </div>
            </v-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { FixtureControlType } from '@/models/FixtureControl';
import SceneSelector from '@/components/SceneSelector.vue';
import SliderFixtureControl from '@/components/FixtureControls/Slider.vue';
import ColorpickerFixtureControl from '@/components/FixtureControls/Colorpicker.vue';
import SwitchFixtureControl from '@/components/FixtureControls/Switch.vue';
import { useDmxStore } from '@/stores/dmx';
import type Fixture from '@/models/Fixture';
import type Scene from '@/models/Scene';
import type Group from '@/models/Group';

const store = useDmxStore();

function onChangeDMXEnabled(): void {
    store.sendDMXState();
    store.persistState();
}
</script>