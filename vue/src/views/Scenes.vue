<template>
    <div class="home">
        <h1>Scenes</h1>
        <input type="text" v-model="formScene.name">
        <button @click="addOrSave()">{{ editing ? "Save" : "Add" }}</button>
        <div v-if="editing">
            <div v-for="fixture in fixtures" :key="fixture.name">
                {{ fixture.name }}
                <input type="text" v-model.number="fixtureSceneConfig[fixture.name][formScene.name][0]">
                <input type="text" v-model.number="fixtureSceneConfig[fixture.name][formScene.name][1]">
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
                obj[scene.name] = [fixture.sceneConfig.get(scene)?.channel, fixture.sceneConfig.get(scene)?.value];
            });
            this.fixtureSceneConfig[fixture.name] = obj;
        });
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
                const dmxcommand = this.fixtureSceneConfig[fixture.name][scene.name];
                const channel = dmxcommand[0]
                const value = dmxcommand[1]
                if (!Number.isInteger(channel) || !Number.isInteger(value)) {
                    fixture.sceneConfig.delete(scene);
                    return;
                }
                fixture.sceneConfig.set(scene, new DMXCommand(channel, value));
            });

        });
        this.formScene = new Scene('');
        this.editing = false;
        this.generateFixtureSceneConfig();
        this.$store.dispatch('persistState');
    }

    remove(scene: Scene): void {
        this.scenes.splice(this.scenes.indexOf(scene), 1);
        this.$store.dispatch('persistState');
    }
}
</script>
