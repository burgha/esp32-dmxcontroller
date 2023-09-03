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
                        <div v-for="fixture in store.fixtures" :key="fixture.name" class="my-5">
                            <div class="d-flex align-center justify-center">
                                <h4>{{ fixture.name }}</h4>
                                <v-btn v-if="fixture.sceneConfig.get(editingScene.name)" click
                                    @click="copyCommands(fixture as Fixture, editingScene as Scene)"><v-icon
                                        :icon="mdiContentCopy"></v-icon></v-btn>
                                <v-btn icon @click="pasteCommands(fixture as Fixture, editingScene as Scene)"><v-icon
                                        :icon="mdiContentPaste"></v-icon></v-btn>
                            </div>
                            <v-container v-if="fixture.sceneConfig">
                                <v-row v-for="command in fixture.sceneConfig.get(editingScene.name)" :key="command.channel">
                                    <v-col cols="4">
                                        <v-text-field v-model.number="command.channel" placeholder="Address" />
                                    </v-col>
                                    <v-col cols="4">
                                        <v-text-field v-model.number="command.value" placeholder="Value" />
                                    </v-col>
                                    <v-col cols="4">
                                        <v-btn
                                            @click="deleteCommandFromFixtureSceneConfig(fixture as Fixture, editingScene as Scene, fixture.sceneConfig.get(editingScene.name)!.indexOf(command))">
                                            Delete Command
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-container>
                            <v-btn @click="addCommandToFixtureSceneConfig(fixture as Fixture, editingScene as Scene)">Add
                                Command</v-btn>
                        </div>
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
import { getCurrentInstance, ref } from 'vue'
import DMXCommand from '@/models/DMXCommand';
import Fixture from '@/models/Fixture';
import Scene from '@/models/Scene'
import { useDmxStore } from '@/stores/dmx';
import { mdiContentCopy, mdiContentPaste } from '@mdi/js';

const store = useDmxStore();

let editingScene = ref(new Scene(''));
let editing = ref(false);
let sceneEditDialog = ref(false);

let commandClipboard: DMXCommand[] = [];


function addCommandToFixtureSceneConfig(fixture: Fixture, scene: Scene): void {
    if (!fixture.sceneConfig.has(scene.name)) {
        fixture.sceneConfig.set(scene.name, []);
    }
    fixture.sceneConfig.get(scene.name)?.push(new DMXCommand(0, 0));
    const instance = getCurrentInstance();
    instance?.proxy?.$forceUpdate();
}

function deleteCommandFromFixtureSceneConfig(fixture: Fixture, scene: Scene, index: number): void {
    fixture.sceneConfig.get(scene.name)?.splice(index, 1);
    const instance = getCurrentInstance();
    instance?.proxy?.$forceUpdate();
}

function copyCommands(fixture: Fixture, scene: Scene): void {
    commandClipboard = fixture.sceneConfig.get(scene.name) ?? [];
}

function pasteCommands(fixture: Fixture, scene: Scene): void {
    if (commandClipboard.length === 0) {
        return;
    }
    if (fixture.sceneConfig.get(scene.name) === undefined) {
        fixture.sceneConfig.set(scene.name, []);
    }
    fixture.sceneConfig.get(scene.name)?.push(...commandClipboard.map(x => new DMXCommand(x.channel, x.value)));
    const instance = getCurrentInstance();
    instance?.proxy?.$forceUpdate();
}

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
</script>
