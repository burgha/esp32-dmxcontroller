<template>
    <div class="scenes ma-2">
        <div v-for="scene in store.scenes" :key="scene.name">
            {{ scene.name }}
            <v-btn class="ma-2" @click="editScene(scene as Scene)">Edit</v-btn>
            <v-btn class="ma-2" @click="deleteScene(scene as Scene)">Delete</v-btn>
        </div>

        <v-btn class="mt-4" @click="createScene()">Create</v-btn>

        <v-dialog v-model="sceneEditDialog" width="80%">
            <v-card>
                <v-card-text>
                    <v-text-field v-model="editingScene.name" placeholder="Name" />
                    <div v-if="editing">
                        <v-expansion-panels multiple>
                            <v-expansion-panel v-for="fixture in store.fixtures" :key="fixture.name" :title="fixture.name">
                                <v-expansion-panel-text>
                                    <div v-for="control in fixture.controls" :key="control.name" v-if="fixture.sceneConfig" class="ma-4 text-left">
                                        <h5 class="mb-4">{{ control.name }}</h5>
                                        <FixtureController :target="(fixture as Fixture)" :control="(control as FixtureControl)" @value-changed="(data: FixtureControlValueChangedEventArgs) => valueChanged(fixture as Fixture, data)"></FixtureController>
                                    </div>
                                </v-expansion-panel-text>
                            </v-expansion-panel>
                        </v-expansion-panels>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-btn v-if="!editing" @click="addScene()">Add</v-btn>
                    <v-btn v-if="editing" @click="saveScene()">Save</v-btn>
                    <v-btn v-if="editing" @click="deleteScene(editingScene as Scene)">Delete</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Fixture from '@/models/Fixture';
import Scene from '@/models/Scene'
import { useDmxStore } from '@/stores/dmx';
import FixtureController from '@/components/FixtureController.vue';
import type FixtureControl from '@/models/FixtureControl';
import type { FixtureControlValueChangedEventArgs } from '@/models/FixtureControlValueChangedEventArgs';

const store = useDmxStore();

let editingScene = ref(new Scene(''));
let editing = ref(false);
let sceneEditDialog = ref(false);

function createScene(): void {
    editingScene.value = new Scene("");
    editing.value = false;
    sceneEditDialog.value = true;
}

function addScene(): void {
    if (editingScene.value.name === '') {
        return;
    }
    sceneEditDialog.value = false;
    store.scenes.push(editingScene.value);
    store.persistState();
}

function editScene(scene: Scene): void {
    editing.value = true;
    editingScene.value = scene;
    sceneEditDialog.value = true;

    // Zu bearbeitende Szene auf Fixtures zeigen.
    store.fixtures.forEach(f => {
        f.applyCommands(f.sceneConfig?.get(scene.name) ?? []);
    });
    store.sendDMXData();
}

function saveScene(): void {
    sceneEditDialog.value = false;
    store.persistState();
}

function deleteScene(scene: Scene): void {
    store.scenes.splice(store.scenes.indexOf(scene), 1);
    sceneEditDialog.value = false;
    store.persistState();
}

function valueChanged(fixture: Fixture, data: FixtureControlValueChangedEventArgs): void {
    let commands = fixture.sceneConfig.get(editingScene.value.name) ?? [];
    // Bestehende Commands aktualisieren anstatt Array ersetzen, damit Funktion von mehreren Controls (jeweils mit Teildaten) aufgerufen werden kann.
    data.commands.forEach(command => {
        const c = commands.find(x => x.channel === command.channel);
        if (c) {
            c.value = command.value;
        } else {
            commands.push(command);
        }
    });
    console.log(commands);
    fixture.sceneConfig.set(editingScene.value.name, commands);
}
</script>
