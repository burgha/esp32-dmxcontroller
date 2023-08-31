<template>
    <div class="scenes">
        <v-sheet class="ma-4 pa-4" elevation="2">
            <h2>Scenes</h2>
            <v-text-field v-model="formScene.name" placeholder="Name" />

            <div v-if="editing">
                <div v-for="fixture in store.fixtures" :key="fixture.name" class="my-5">
                    <div class="d-flex align-center justify-center">
                        <h4>{{ fixture.name }}</h4>
                        <v-btn v-if="fixture.sceneConfig.get(formScene.name)" click
                            @click="copyCommands(fixture as Fixture, formScene as Scene)"><v-icon
                                :icon="mdiContentCopy"></v-icon></v-btn>
                        <v-btn icon @click="pasteCommands(fixture as Fixture, formScene as Scene)"><v-icon
                                :icon="mdiContentPaste"></v-icon></v-btn>
                    </div>
                    <v-container v-if="fixture.sceneConfig">
                        <v-row v-for="command in fixture.sceneConfig.get(formScene.name)"
                            :key="command.channel">
                            <v-col cols="4">
                                <v-text-field v-model.number="command.channel" placeholder="Address" />
                            </v-col>
                            <v-col cols="4">
                                <v-text-field v-model.number="command.value" placeholder="Value" />
                            </v-col>
                            <v-col cols="4">
                                <v-btn
                                    @click="deleteCommandFromFixtureSceneConfig(fixture as Fixture, formScene as Scene, fixture.sceneConfig.get(formScene.name)!.indexOf(command))">
                                    Delete Command
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-container>
                    <v-btn @click="addCommandToFixtureSceneConfig(fixture as Fixture, formScene as Scene)">Add
                        Command</v-btn>
                </div>
            </div>
            <v-btn v-if="!editing" class="ma-4" @click="add()">Add</v-btn>
            <v-btn v-if="editing" class="ma-4" @click="save()">Save</v-btn>
        </v-sheet>

        <div v-for="scene in store.scenes" :key="scene.name" class="ma-2">
            {{ scene.name }}
            <v-btn class="ma-2" @click="edit(scene as Scene)">Edit</v-btn>
            <v-btn class="ma-2" @click="remove(scene as Scene)">Delete</v-btn>
            <v-divider v-if="store.scenes.indexOf(scene) < store.scenes.length - 1" />
        </div>
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

let formScene = ref(new Scene(''));
let editing = ref(false);
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

function add(): void {
    if (formScene.value.name === '') {
        return;
    }
    store.scenes.push(formScene.value);
    formScene.value = new Scene('');
    store.persistState();
}

function edit(scene: Scene): void {
    formScene.value = scene;
    editing.value = true;
}

function save(): void {
    formScene.value = new Scene('');
    editing.value = false;

    store.persistState();
}

function remove(scene: Scene): void {
    store.scenes.splice(store.scenes.indexOf(scene), 1);
    formScene.value = new Scene('');
    store.persistState();
}
</script>
