<template>
    <div class="home">
        <h1>Scenes</h1>
        <input v-model="formScene.name" type="text">
        <button @click="addOrSave()">{{ editing ? "Save" : "Add" }}</button>
        <div v-if="editing">
            <div v-for="fixture in fixtures" :key="fixture.name">
                {{ fixture.name }}
                <button @click="addCommandToFixtureSceneConfig(fixture, formScene)">Add Command</button>
                <div v-for="command in fixtureSceneConfig[fixture.name][formScene.name]" :key="command[0] + Math.random()">
                    <input v-model.number="command[0]" type="text">
                    <input v-model.number="command[1]" type="text">
                    <button @click="deleteCommandFromFixtureSceneConfig(fixture, formScene, fixtureSceneConfig[fixture.name][formScene.name].indexOf(command))">Delete Command</button>
                </div>
            </div>
        </div>

        <hr>
        <div v-for="scene in scenes" :key="scene.name">
            {{ scene.name }} <span @click="edit(scene)">E</span>    <span @click="remove(scene)">X</span>
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
        this.fixtureSceneConfig[fixture.name][scene.name].push([5, 5]);
        this.$forceUpdate();
    }

    deleteCommandFromFixtureSceneConfig(fixture: Fixture, scene: Scene, index: number): void {
        this.fixtureSceneConfig[fixture.name][scene.name].splice(index, 1);
        this.$forceUpdate();
    }

    addOrSave(): void {
        if (this.editing) {
            this.save();
        } else {
            this.add();
        }
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
                let dmxcommands = this.fixtureSceneConfig[fixture.name][scene.name];

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
