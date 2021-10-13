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
            
            <div v-if="editing">
                <h3>Controls</h3>
                <div v-for="control in formFixture.controls" :key="control.name">
                    {{ control.name }}
                    <v-btn class="ma-2" @click="editControl(control)">Edit</v-btn>
                    <v-btn class="ma-2" @click="removeControl(control)">Delete</v-btn>
                    <v-divider v-if="formFixture.controls.indexOf(control) < control.length - 1" />
                </div>
                <v-container>
                    <v-row>
                        <v-col cols="12" md="10">
                            <v-text-field v-model="formFixtureControl.name" placeholder="Name" />
                            <v-select v-model="formFixtureControl.type" :items="fixtureControlTypes" placeholder="Type" />
                            <v-text-field v-model="formFixtureControl.config" placeholder="Config" />
                        </v-col>
                        <v-col cols="12" md="2">
                            <v-btn v-if="!editingFixtureControl" @click="addControl()">Add</v-btn>
                            <v-btn v-if="editingFixtureControl" @click="saveControl()">Save</v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </div>
        </v-sheet>

        <div v-for="fixture in fixtures" :key="fixture.name">
            {{ fixture.name }}({{ fixture.address }} - {{ Number(fixture.address) + Number(fixture.numChannels) }})
            <v-btn class="ma-2" @click="edit(fixture)">Edit</v-btn>
            <v-btn class="ma-2" @click="remove(fixture)">Delete</v-btn>

            <div v-for="control in fixture.controls" :key="control.name">
                <div v-if="control.type === FixtureControlType.Slider">
                    <SliderFixtureControl :fixture="fixture" :channels="control.config.trim().split(',').map(e => parseInt(e))" />
                </div>
                <div v-if="control.type === FixtureControlType.Colorpicker">
                    <ColorpickerFixtureControl :fixture="fixture" :channels="control.config.trim().split(',').map(e => parseInt(e))" />
                </div>
            </div>

            <v-divider v-if="fixtures.indexOf(fixture) < fixtures.length - 1" />
        </div>
    </div>
</template>

<script lang="ts">
import Fixture from '@/models/Fixture';
import FixtureControl from '@/models/FixtureControl';
import { FixtureControlType } from '@/models/FixtureControl';
import SliderFixtureControl from '@/components/FixtureControls/Slider.vue';
import ColorpickerFixtureControl from '@/components/FixtureControls/Colorpicker.vue';
import Scene from '@/models/Scene';
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
    components: {
        SliderFixtureControl,
        ColorpickerFixtureControl
    }
})
export default class Fixtures extends Vue {
    private FixtureControlType = FixtureControlType;

    private formFixture = new Fixture('', 0, 0);
    private editing = false;

    private formFixtureControl = new FixtureControl('', FixtureControlType.Slider);
    private editingFixtureControl = false;

    get fixtures(): Fixture[] {
        return this.$store.state.fixtures; 
    }

    get scenes(): Scene[] {
        return this.$store.state.scenes; 
    }

    get fixtureControlTypes(): object[] {
        return Object.keys(FixtureControlType).map((x: any) => {
            return {text: x, value: FixtureControlType[x]}
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
        if (this.formFixture.name === '') {
            return;
        }
        this.fixtures.push(this.formFixture);
        this.formFixture = new Fixture('', 0, 0);
        this.$store.dispatch('persistState');
    }

    edit(fixture: Fixture): void {
        this.formFixture = fixture;
        this.editing = true;
    }

    save() {
        this.$store.dispatch('persistState');
        this.formFixture = new Fixture('', 0, 0);
        this.editing = false;
    }

    remove(fixture: Fixture): void {
        this.fixtures.splice(this.fixtures.indexOf(fixture), 1);
        this.$store.dispatch('persistState');
    }

    addControl() {
        if (this.formFixtureControl.name === '') {
            return;
        }
        this.$store.dispatch('persistState');
        this.formFixture.controls.push(this.formFixtureControl);
        this.formFixtureControl = new FixtureControl('', FixtureControlType.Slider);
        this.editingFixtureControl = false;
    }

    editControl(control: FixtureControl) {
        this.formFixtureControl = control;
        this.editingFixtureControl = true;
    }

    saveControl() {
        this.$store.dispatch('persistState');
        this.formFixtureControl = new FixtureControl('', FixtureControlType.Slider);
        this.editingFixtureControl = false;
    }

    removeControl(control: FixtureControl) {
        this.formFixture.controls.splice(this.formFixture.controls.indexOf(control), 1);
        this.$store.dispatch('persistState');
    }
}
</script>
