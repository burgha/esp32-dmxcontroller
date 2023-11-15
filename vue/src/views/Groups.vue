<template>
    <div class="groups pa-2">
        <div v-for="group in store.groups" :key="group.name">
            <div class="d-flex align-center">
                <p class="text-h6">{{ group.name }}</p>
                <v-badge :content="group.members.length" inline></v-badge>
                <v-btn class="ma-2" @click="editGroup(group as Group)">Edit</v-btn>
                <v-btn class="ma-2" @click="deleteGroup(group as Group)">Delete</v-btn>
            </div>
        </div>

        <v-btn class="mt-4" @click="createGroup()">Create</v-btn>
    </div>

    <v-dialog v-model="groupEditDialog" width="80%">
        <v-card>
            <v-card-text>
                <v-text-field v-model="editingGroup.name" placeholder="Name" />
                <p>Members:</p>
                <v-row v-for="fixture in store.fixtures" :key="fixture.name" justify="center">
                    <v-col cols="4">
                        <v-checkbox :model-value="editingGroupMembers.includes(fixture)" :label="fixture.name"
                            @update:model-value="(v) => setEditingMembershipValue(v, fixture as Fixture)" />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-btn v-if="!editing" @click="addGroup()">Add</v-btn>
                <v-btn v-if="editing" @click="saveGroup()">Save</v-btn>
                <v-btn v-if="editing" @click="deleteGroup(editingGroup as Group)">Delete</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import Fixture from '@/models/Fixture';
import Group from '@/models/Group';
import { useDmxStore } from '@/stores/dmx';
import { ref } from 'vue';

const store = useDmxStore();

let editingGroup = ref(new Group(''));
let editingGroupMembers = ref([] as Fixture[]);
let editing = ref(false);

let groupEditDialog = ref(false);

function createGroup(): void {
    groupEditDialog.value = true;
    editing.value = false;
    editingGroup.value = new Group("");
    editingGroupMembers.value = [];
}

function addGroup(): void {
    if (editingGroup.value.name === '') {
        return;
    }
    groupEditDialog.value = false;
    store.groups.push(editingGroup.value);
    editingGroup.value.members = editingGroupMembers.value;
    store.persistState();
}

function editGroup(group: Group): void {
    groupEditDialog.value = true;
    editing.value = true;
    editingGroup.value = group;
    editingGroupMembers.value = store.fixtures.filter(f => isFixtureInGroup(group, f as Fixture));
}

function saveGroup(): void {
    groupEditDialog.value = false;
    editingGroup.value.members = editingGroupMembers.value;
    editing.value = false;
    store.persistState();
}

function deleteGroup(group: Group): void {
    groupEditDialog.value = false;
    store.groups.splice(store.groups.indexOf(group), 1);
    store.persistState();
}

function isFixtureInGroup(group: Group, fixture: Fixture): boolean {
    return group.members.find(x => x.name === fixture.name) !== undefined;
}

function setEditingMembershipValue(v: boolean | null, f: Fixture) {
    if (v) {
        editingGroupMembers.value.push(f);
    } else {
        editingGroupMembers.value.splice(editingGroupMembers.value.indexOf(f));
    }
}
</script>
