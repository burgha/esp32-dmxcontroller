<template>
    <div class="groups">
        <v-sheet class="ma-4 pa-4" elevation="2">
            <h2>Groups</h2>
            <v-container>
                <v-row>
                    <v-col cols="12" md="10">
                        <v-text-field v-model="formGroup.name" placeholder="Name" />
                    </v-col>
                    <v-col cols="12" md="2">
                        <v-btn v-if="!editing" @click="add()">Add</v-btn>
                        <v-btn v-if="editing" @click="save()">Save</v-btn>
                    </v-col>
                </v-row>
            </v-container>
        </v-sheet>

        <div v-for="group in store.groups" :key="group.name">
            <p class="text-h6">{{ group.name }}</p>
            <v-btn class="ma-2" @click="edit(group as Group)">Edit</v-btn>
            <v-btn class="ma-2" @click="remove(group as Group)">Delete</v-btn>
            <v-container>
                <p>Members:</p>
                <v-row v-for="fixture in store.fixtures" :key="fixture.name" justify="center">
                    <v-col cols="4">
                        <v-checkbox class="align-center justify-center"
                            :model-value="isFixtureInGroup(group as Group, fixture as Fixture)" :label="fixture.name"
                            @click="toggleMembership(group as Group, fixture as Fixture)" />
                    </v-col>
                </v-row>
                <v-divider v-if="store.groups.indexOf(group) < store.groups.length - 1" />
            </v-container>
        </div>
    </div>
</template>

<script setup lang="ts">
import Fixture from '@/models/Fixture';
import Group from '@/models/Group';
import { useDmxStore } from '@/stores/dmx';
import { ref } from 'vue';

const store = useDmxStore();

let formGroup = ref(new Group(''));
let editing = ref(false);

function add(): void {
    if (formGroup.value.name === '') {
        return;
    }
    store.groups.push(formGroup.value);
    formGroup.value = new Group('');
    store.persistState();
}

function edit(group: Group): void {
    formGroup.value = group;
    editing.value = true;
}

function save(): void {
    formGroup.value = new Group('');
    editing.value = false;
    store.persistState();
}

function remove(group: Group): void {
    store.groups.splice(store.groups.indexOf(group), 1);
    store.persistState();
}

function toggleMembership(group: Group, fixture: Fixture): void {
    if (isFixtureInGroup(group, fixture)) {
        group.members.splice(group.members.indexOf(fixture), 1);
    } else {
        group.members.push(fixture);
    }
    store.setGroups(store.groups as Group[]);
    store.persistState();
}

function isFixtureInGroup(group: Group, fixture: Fixture): boolean {
    return group.members.includes(fixture);
}
</script>
