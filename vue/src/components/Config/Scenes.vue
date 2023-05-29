<template>
    <div class="scenes">
        <v-sheet class="ma-4 pa-4" elevation="2">
            <h2>Scenes</h2>
            <v-text-field v-model="formScene.name" placeholder="Name" />

            <div v-if="editing">
                <div v-for="fixture in store.fixtures" :key="fixture.name" class="my-5">
                    <div class="d-flex align-center justify-center">
                        <h4>{{ fixture.name }}</h4>
                        <v-btn v-if="fixtureSceneConfig[fixture.name][formScene.name]" click
                            @click="copyCommands(fixture as Fixture, formScene as Scene)"><v-icon :icon="mdiContentCopy"></v-icon></v-btn>
                        <v-btn icon
                            @click="pasteCommands(fixture as Fixture, formScene as Scene)"><v-icon :icon="mdiContentPaste"></v-icon></v-btn>
                    </div>
                    <v-container v-if="fixtureSceneConfig[fixture.name]">
                        <v-row v-for="command in fixtureSceneConfig[fixture.name][formScene.name]"
                            :key="command[0] + Math.random()">
                            <v-col cols="4">
                                <v-text-field v-model.number="command[0]" placeholder="Address" />
                            </v-col>
                            <v-col cols="4">
                                <v-text-field v-model.number="command[1]" placeholder="Value" />
                            </v-col>
                            <v-col cols="4">
                                <v-btn
                                    @click="deleteCommandFromFixtureSceneConfig(fixture as Fixture, formScene as Scene, fixtureSceneConfig[fixture.name][formScene.name].indexOf(command))">
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
let fixtureSceneConfig = ref<any>({})
let commandClipboard: [] = [];

function generateFixtureSceneConfig() {
    store.fixtures.forEach(fixture => {
        const obj: any = {}
        store.scenes.forEach(scene => {
            obj[scene.name] = fixture.sceneConfig.get(scene as Scene)?.map((c: DMXCommand) => {
                return [c.channel, c.value];
            });
        });
        fixtureSceneConfig.value[fixture.name] = obj;
    });
}

function addCommandToFixtureSceneConfig(fixture: Fixture, scene: Scene): void {
    if (fixtureSceneConfig.value[fixture.name][scene.name] === undefined) {
        fixtureSceneConfig.value[fixture.name][scene.name] = [];
    }
    fixtureSceneConfig.value[fixture.name][scene.name].push([null, null]);
    const instance = getCurrentInstance();
    instance?.proxy?.$forceUpdate();
}

function deleteCommandFromFixtureSceneConfig(fixture: Fixture, scene: Scene, index: number): void {
    fixtureSceneConfig.value[fixture.name][scene.name].splice(index, 1);
    const instance = getCurrentInstance();
    instance?.proxy?.$forceUpdate();
}

function copyCommands(fixture: Fixture, scene: Scene): void {
    commandClipboard = fixtureSceneConfig.value[fixture.name][scene.name];
}

function pasteCommands(fixture: Fixture, scene: Scene): void {
    if (commandClipboard.length === 0) {
        return;
    }
    fixtureSceneConfig.value[fixture.name][scene.name] = commandClipboard.map(x => [x[0], x[1]]);
    const instance = getCurrentInstance();
    instance?.proxy?.$forceUpdate();
}

function add(): void {
    if (formScene.value.name === '') {
        return;
    }
    store.scenes.push(formScene.value);
    formScene.value = new Scene('');
    generateFixtureSceneConfig();
    store.persistState();
}

function edit(scene: Scene): void {
    generateFixtureSceneConfig();
    formScene.value = scene;
    editing.value = true;
}

function save(): void {
    store.fixtures.forEach(fixture => {
        store.scenes.forEach(scene => {
            let dmxcommands = fixtureSceneConfig.value[fixture.name][scene.name] ?? [];

            dmxcommands = dmxcommands.filter((c: any[]) => {
                return Number.isInteger(c[0]) && Number.isInteger(c[1])
            });

            fixture.sceneConfig.delete(scene as Scene);
            fixture.sceneConfig.set(scene as Scene, dmxcommands.map((c: any[]) => {
                return new DMXCommand(c[0], c[1]);
            }));
        });

    });
    formScene.value = new Scene('');
    editing.value = false;
    generateFixtureSceneConfig();
    store.persistState();
}

function remove(scene: Scene): void {
    store.scenes.splice(store.scenes.indexOf(scene), 1);
    formScene.value = new Scene('');
    store.persistState();
}
</script>
