<template>
    <div class="fixtures pa-2">
        <div v-for="fixture in store.fixtures" :key="fixture.name">
            {{ fixture.name }} ({{ fixture.address }} - {{ Number(fixture.address) + Number(fixture.numChannels) - 1 }})
            <v-btn class="ma-2" @click="editFixture(fixture as Fixture)">Edit</v-btn>
            <v-btn class="ma-2" @click="deleteFixture(fixture as Fixture)">Delete</v-btn>
        </div>

        <v-btn class="mt-4" @click="createFixture()">Create</v-btn>

        <v-dialog v-model="fixtureEditDialog" width="80%">
            <v-card>
                <v-card-text>
                    <v-text-field v-model="editingFixture.name" label="Name" />
                    <v-text-field v-model.number="editingFixture.address" label="Address" />
                    <v-text-field v-model.number="editingFixture.numChannels" label="Channels" />

                    <div v-if="editing">
                        <h3>Controls</h3>
                        <div v-for="control in editingFixture.controls" :key="control.name">
                            {{ control.name }}
                            <v-btn class="ma-2" @click="editControl(control as FixtureControl)">Edit</v-btn>
                            <v-btn class="ma-2" @click="deleteControl(control as FixtureControl)">Delete</v-btn>
                        </div>
                        <v-btn class="pa-2" @click="createControl()">Create</v-btn>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-btn v-if="!editing" class="ma-4" @click="addFixture()">Add</v-btn>
                    <v-btn v-if="editing" class="ma-4" @click="saveFixture()">Save</v-btn>
                    <v-btn v-if="editing" class="ma-2" @click="deleteFixture(editingFixture as Fixture)">Delete</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="controlEditDialog" width="80%">
            <v-card>
                <v-card-text>
                    <v-text-field v-model="editingFixtureControl.name" label="Name" />
                    <v-select v-model="editingFixtureControl.type" :items="fixtureControlTypes" label="Type" />
                    <v-text-field v-model="editingFixtureControl.config" label="Config">
                        <template v-slot:append>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ props }">
                                    <v-icon v-bind="props" :icon="mdiHelpCircleOutline" />
                                </template>
                                <p v-if="editingFixtureControl.type === FixtureControlType.Slider">Channel
                                    List
                                    (comma-separated)</p>
                                <p v-if="editingFixtureControl.type === FixtureControlType.Colorpicker">
                                    Channel(R),
                                    Channel(G), Channel(B)</p>
                                <p v-if="editingFixtureControl.type === FixtureControlType.Switch">Channel,
                                    On-Value,
                                    Off-Value</p>
                            </v-tooltip>
                        </template>
                    </v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-btn v-if="!editingControl" @click="addControl()">Add</v-btn>
                    <v-btn v-if="editingControl" @click="saveControl()">Save</v-btn>
                    <v-btn v-if="editingControl"
                        @click="deleteControl(editingFixtureControl as FixtureControl)">Delete</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
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

let editingFixture = ref(new Fixture('', 0, 0));
let editing = ref(false);
let fixtureEditDialog = ref(false);

let editingFixtureControl = ref(new FixtureControl('', FixtureControlType.Slider));
let editingControl = ref(false);
let controlEditDialog = ref(false);

const fixtureControlTypes = computed(() => {
    return Object.keys(FixtureControlType).filter((x) => { return isNaN(parseInt(x, 10)) }).map((x: any) => {
        return { title: x, value: FixtureControlType[x] }
    });
});

function createFixture(): void {
    editing.value = false;
    editingFixture.value = new Fixture("", 0, 0);
    fixtureEditDialog.value = true;
}

function addFixture(): void {
    if (editingFixture.value.name === '') {
        return;
    }
    fixtureEditDialog.value = false;
    store.fixtures.push(editingFixture.value);
    store.persistState();
}

function editFixture(fixture: Fixture): void {
    editingFixture.value = fixture;
    editing.value = true;
    fixtureEditDialog.value = true;
}

function saveFixture() {
    fixtureEditDialog.value = false;
    editing.value = false;
    store.persistState();
}

function deleteFixture(fixture: Fixture): void {
    fixtureEditDialog.value = false;
    store.fixtures.splice(store.fixtures.indexOf(fixture), 1);
    store.persistState();
}

function createControl(): void {
    editingFixtureControl.value = new FixtureControl("", FixtureControlType.Slider);
    editingControl.value = false;
    controlEditDialog.value = true;
}

function addControl(): void {
    if (editingFixtureControl.value.name === '') {
        return;
    }
    controlEditDialog.value = true;
    editingFixture.value.controls.push(editingFixtureControl.value);
    controlEditDialog.value = false;
    store.persistState();
}

function editControl(control: FixtureControl): void {
    editingFixtureControl.value = control;
    editingControl.value = true;
    controlEditDialog.value = true;
}

function saveControl(): void {
    controlEditDialog.value = false;
    store.persistState();
}

function deleteControl(control: FixtureControl): void {
    editingFixture.value.controls.splice(editingFixture.value.controls.indexOf(control), 1);
    controlEditDialog.value = false;
    store.persistState();
}
</script>
