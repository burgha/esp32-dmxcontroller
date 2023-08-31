<template>
    <div class="fixtures">
        <v-sheet class="ma-4 pa-4" elevation="2">
            <h2>Fixtures</h2>
            <v-container>
                <v-row>
                    <v-col cols="12" md="10">
                        <v-text-field v-model="formFixture.name" label="Name" />
                        <v-text-field v-model.number="formFixture.address" label="Address" />
                        <v-text-field v-model.number="formFixture.numChannels" label="Channels" />
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
                    <v-btn class="ma-2" @click="editControl(control as FixtureControl)">Edit</v-btn>
                    <v-btn class="ma-2" @click="removeControl(control as FixtureControl)">Delete</v-btn>
                    <v-divider v-if="formFixture.controls.indexOf(control) < formFixture.controls.length - 1" />
                </div>
                <v-container>
                    <v-row>
                        <v-col cols="12" md="10">
                            <v-text-field v-model="formFixtureControl.name" label="Name" />
                            <v-select v-model="formFixtureControl.type" :items="fixtureControlTypes" label="Type" />
                            <v-text-field v-model="formFixtureControl.config" label="Config">
                                <template v-slot:append>
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ props }">
                                            <v-icon v-bind="props" :icon="mdiHelpCircleOutline"/>
                                        </template>
                                        <p v-if="formFixtureControl.type === FixtureControlType.Slider">Channel List
                                            (comma-separated)</p>
                                        <p v-if="formFixtureControl.type === FixtureControlType.Colorpicker">Channel(R),
                                            Channel(G), Channel(B)</p>
                                        <p v-if="formFixtureControl.type === FixtureControlType.Switch">Channel, On-Value,
                                            Off-Value</p>
                                    </v-tooltip>
                                </template>
                            </v-text-field>
                        </v-col>
                        <v-col cols="12" md="2">
                            <v-btn v-if="!editingFixtureControl" @click="addControl()">Add</v-btn>
                            <v-btn v-if="editingFixtureControl" @click="saveControl()">Save</v-btn>
                        </v-col>
                    </v-row>
                </v-container>
            </div>
        </v-sheet>

        <div v-for="fixture in store.fixtures" :key="fixture.name">
            {{ fixture.name }} ({{ fixture.address }} - {{ Number(fixture.address) + Number(fixture.numChannels) }})
            <v-btn class="ma-2" @click="edit(fixture as Fixture)">Edit</v-btn>
            <v-btn class="ma-2" @click="remove(fixture as Fixture)">Delete</v-btn>
            <v-divider v-if="store.fixtures.indexOf(fixture) < store.fixtures.length - 1" />
        </div>
    </div>
</template>

<script setup lang="ts">
import Fixture from '@/models/Fixture';
import FixtureControl from '@/models/FixtureControl';
import { FixtureControlType } from '@/models/FixtureControl';
import { useDmxStore } from '@/stores/dmx';
import { computed, ref } from 'vue';
import { mdiHelpCircleOutline } from '@mdi/js';

const store = useDmxStore();

let formFixture = ref(new Fixture('', 0, 0));
let editing = ref(false);

let formFixtureControl = ref(new FixtureControl('', FixtureControlType.Slider));
let editingFixtureControl = ref(false);

const fixtureControlTypes = computed(() => {
    return Object.keys(FixtureControlType).filter((x) => { return isNaN(parseInt(x, 10)) }).map((x: any) => {
        return { title: x, value: FixtureControlType[x] }
    });
});

function add(): void {
    if (formFixture.value.name === '') {
        return;
    }
    store.fixtures.push(formFixture.value);
    formFixture.value = new Fixture('', 0, 0);
    store.persistState();
}

function edit(fixture: Fixture): void {
    formFixture.value = fixture;
    editing.value = true;
}

function save() {
    store.persistState();
    formFixture.value = new Fixture('', 0, 0);
    editing.value = false;
}

function remove(fixture: Fixture): void {
    store.fixtures.splice(store.fixtures.indexOf(fixture), 1);
    store.persistState();
}

function addControl() {
    if (formFixtureControl.value.name === '') {
        return;
    }
    store.persistState();
    formFixture.value.controls.push(formFixtureControl.value);
    formFixtureControl.value = new FixtureControl('', FixtureControlType.Slider);
    editingFixtureControl.value = false;
}

function editControl(control: FixtureControl) {
    formFixtureControl.value = control;
    editingFixtureControl.value = true;
}

function saveControl() {
    store.persistState();
    formFixtureControl.value = new FixtureControl('', FixtureControlType.Slider);
    editingFixtureControl.value = false;
}

function removeControl(control: FixtureControl) {
    formFixture.value.controls.splice(formFixture.value.controls.indexOf(control), 1);
    store.persistState();
}
</script>
