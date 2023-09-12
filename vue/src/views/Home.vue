<template>
    <div class="home pa-2">
        <v-switch label="Enable DMX" v-model="store.dmxEnabled" @change="onChangeDMXEnabled()" />

        <h2>Groups</h2>
        <v-expansion-panels class="mb-4" multiple>
            <v-expansion-panel v-for="group in store.groups" :key="group.name" :title="group.name">
                <v-expansion-panel-text>
                    <p>Members: {{ group.members.map(x => x.name).join(', ') }}</p>
                    <SceneSelector :target="(group as Group)" :scenes="(store.scenes as Scene[])" />
                </v-expansion-panel-text>
            </v-expansion-panel>
        </v-expansion-panels>

        <h2>Fixtures</h2>
        <v-expansion-panels multiple>
            <v-expansion-panel v-for="fixture in store.fixtures" :key="fixture.name" :title="fixture.name">
                <v-expansion-panel-text>
                    <div v-for="control in fixture.controls" :key="control.name" class="ma-4 text-left">
                        <h5 class="mb-4">{{ control.name }}</h5>
                        <FixtureController :target="(fixture as Fixture)" :control="(control as FixtureControl)"></FixtureController>
                    </div>
                </v-expansion-panel-text>
            </v-expansion-panel>
        </v-expansion-panels>
    </div>
</template>

<script setup lang="ts">
import SceneSelector from '@/components/SceneSelector.vue';
import FixtureController from '@/components/FixtureController.vue';
import { useDmxStore } from '@/stores/dmx';
import type Scene from '@/models/Scene';
import Group from '@/models/Group';
import type Fixture from '@/models/Fixture';
import type FixtureControl from '@/models/FixtureControl';

const store = useDmxStore();

function onChangeDMXEnabled(): void {
    store.sendDMXState();
    store.persistState();
}
</script>