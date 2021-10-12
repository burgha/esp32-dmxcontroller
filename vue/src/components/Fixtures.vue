<template>
    <div class="fixtures">
        <v-sheet class="ma-4 pa-4" elevation="2">
            <h2>Fixtures</h2>
            <v-container>
                <v-row>
                    <v-col cols="12" md="10">
                        <v-text-field v-model="formFixture.name" placeholder="Name" />
                        <v-text-field v-model.number="formFixture.address" placeholder="Address" />
                        <v-text-field v-model.number="formFixture.numChannels" placeholder="Channels" />
                    </v-col>
                    <v-col cols="12" md="2">
                        <v-btn v-if="!editing" @click="add()">Add</v-btn>
                        <v-btn v-if="editing" @click="save()">Save</v-btn>
                    </v-col>
                </v-row>
            </v-container>
        </v-sheet>

        <div v-for="fixture in fixtures" :key="fixture.name">
            {{ fixture.name }}({{ fixture.address }} - {{ Number(fixture.address) + Number(fixture.numChannels) }})
            <v-btn class="ma-2" @click="edit(fixture)">Edit</v-btn>
            <v-btn class="ma-2" @click="remove(fixture)">Delete</v-btn>
            <v-divider v-if="fixtures.indexOf(fixture) < fixtures.length - 1" />
        </div>
    </div>
</template>

<script lang="ts">
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
