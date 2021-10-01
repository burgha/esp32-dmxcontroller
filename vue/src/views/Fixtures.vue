<template>
    <div class="home">
        <h1>Fixtures</h1>
        <input v-model="formFixture.name" type="text">
        <input v-model.number="formFixture.address" type="text">
        <input v-model.number="formFixture.numChannels" type="text">
        <button @click="addOrSave()">{{editing ? "Save" : "Add"}}</button>
        <hr>
        <div v-for="fixture in fixtures" :key="fixture.name">
            {{fixture.name}}({{fixture.address}}) <span @click="edit(fixture)">E</span>    <span @click="remove(fixture)">X</span>
        </div>
    </div>
</template>

<script lang="ts">
//import DMXCommand from '@/models/DMXCommand';
import Fixture from '@/models/Fixture';
import Scene from '@/models/Scene';
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
    components: {
    }
})
export default class Fixtures extends Vue {
    private formFixture = new Fixture("", 0, 0);
    private editing = false;

    get fixtures(): Fixture[] {
        return this.$store.state.fixtures; 
    }

    get scenes(): Scene[] {
        return this.$store.state.scenes; 
    }

    addOrSave(): void {
        if (this.editing) {
            this.save();
        } else {
            this.add();
        }
    }

    add(): void {
        if (this.formFixture.name === '') {
            return;
        }
        this.fixtures.push(this.formFixture);
        this.formFixture = new Fixture("", 0, 0);
        this.$store.dispatch('persistState');
    }

    edit(fixture: Fixture): void {
        this.formFixture = fixture;
        this.editing = true;
    }

    save() {
        console.log(this.formFixture);
        this.$store.dispatch('persistState');
        this.formFixture = new Fixture("", 0, 0);
        this.editing = false;
    }

    remove(fixture: Fixture): void {
        this.fixtures.splice(this.fixtures.indexOf(fixture), 1);
        this.$store.dispatch('persistState');
    }
}
</script>
