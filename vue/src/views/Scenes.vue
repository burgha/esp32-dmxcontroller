<template>
    <div class="scenes">
        <h1>Scenes</h1>
        <v-sheet class="ma-4 pa-4" elevation="2">
            <v-container>
                <v-row justify="space-between">
                    <v-col cols="12" md="10">
                        <v-text-field v-model="formScene.name" placeholder="Name" />
                    </v-col>
                    <v-col cols="12" sm="2">
                        <v-btn v-if="!editing" @click="add()">Add</v-btn>
                        <v-btn v-if="editing" @click="save()">Save</v-btn>
                    </v-col>
                </v-row>
            </v-container>

            <div v-if="editing">
                <div v-for="fixture in fixtures" :key="fixture.name">
                    {{ fixture.name }}
                    <v-container>
                        <v-row v-for="command in fixtureSceneConfig[fixture.name][formScene.name]" :key="command[0] + Math.random()">
                            <v-col cols="4">
                                <v-text-field v-model.number="command[0]" placeholder="Address" />
                            </v-col>
                            <v-col cols="4">
                                <v-text-field v-model.number="command[1]" placeholder="Value" />
                            </v-col>
                            <v-col cols="4">
                                <v-btn @click="deleteCommandFromFixtureSceneConfig(fixture, formScene, fixtureSceneConfig[fixture.name][formScene.name].indexOf(command))">
                                    Delete Command
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-container>
                    <v-btn @click="addCommandToFixtureSceneConfig(fixture, formScene)">Add Command</v-btn>
                </div>
            </div>
        </v-sheet>

        <div v-for="scene in scenes" :key="scene.name" class="ma-2">
            {{ scene.name }}
            <v-btn class="ma-2" @click="edit(scene)">Edit</v-btn>
            <v-btn class="ma-2" @click="remove(scene)">Delete</v-btn>
            <v-divider v-if="scenes.indexOf(scene) < scenes.length - 1" />
        </div>
    </div>
</template>

<script lang="ts">
import DMXCommand from '@/models/DMXCommand';
import Fixture from '@/models/Fixture';
import Scene from '@/models/Scene'
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
    components: {}
})
export default class Scenes extends Vue {
    private formScene = new Scene('');
    private editing = false;

    private fixtureSceneConfig: any = {}

    get scenes(): Scene[] {
        return this.$store.state.scenes; 
    }

    get fixtures(): Fixture[] {
        return this.$store.state.fixtures; 
    }

    mounted(): void {
        this.generateFixtureSceneConfig();
    }

    generateFixtureSceneConfig() {
        this.fixtures.forEach((fixture: Fixture) => {
            const obj: any = {}
            this.scenes.forEach((scene: Scene) => {
                obj[scene.name] = fixture.sceneConfig.get(scene)?.map((c: DMXCommand) => {
                    return [c.channel, c.value];
                });
            });
            this.fixtureSceneConfig[fixture.name] = obj;
        });
    }

    addCommandToFixtureSceneConfig(fixture: Fixture, scene: Scene): void {
        if (this.fixtureSceneConfig[fixture.name][scene.name] === undefined) {
            this.fixtureSceneConfig[fixture.name][scene.name] = [];
        } 
        this.fixtureSceneConfig[fixture.name][scene.name].push([null, null]);
        this.$forceUpdate();
    }

    deleteCommandFromFixtureSceneConfig(fixture: Fixture, scene: Scene, index: number): void {
        this.fixtureSceneConfig[fixture.name][scene.name].splice(index, 1);
        this.$forceUpdate();
    }

    add(): void {
        if (this.formScene.name === '') {
            return;
        }
        this.scenes.push(this.formScene);
        this.formScene = new Scene('');
        this.generateFixtureSceneConfig();
        this.$store.dispatch('persistState');
    }

    edit(scene: Scene): void {
        this.formScene = scene;
        this.editing = true;
    }

    save(): void {
        this.fixtures.forEach((fixture: Fixture) => {
            this.scenes.forEach((scene: Scene) => {
                let dmxcommands = this.fixtureSceneConfig[fixture.name][scene.name] ?? [];

                dmxcommands = dmxcommands.filter((c: any[]) => {
                    return Number.isInteger(c[0]) && Number.isInteger(c[1])
                });
                
                fixture.sceneConfig.delete(scene);
                fixture.sceneConfig.set(scene, dmxcommands.map((c: any[]) => {
                    return new DMXCommand(c[0], c[1]);
                }));
            });

        });
        this.formScene = new Scene('');
        this.editing = false;
        this.generateFixtureSceneConfig();
        this.$store.dispatch('persistState');
    }

    remove(scene: Scene): void {
        this.scenes.splice(this.scenes.indexOf(scene), 1);
        this.formScene = new Scene('');
        this.$store.dispatch('persistState');
    }
}
</script>
