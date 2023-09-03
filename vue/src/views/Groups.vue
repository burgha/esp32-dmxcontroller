<template>
    <div class="groups pa-2">
        <div v-for="group in store.groups" :key="group.name">
            <div class="d-flex align-center">
                <p class="text-h6">{{ group.name }}</p>
                <v-badge :content="group.members.length" inline></v-badge>
                <v-btn class="ma-2" @click="editGroup(group as Group)">Edit</v-btn>
                <v-btn class="ma-2" @click="deleteGroup(group as Group)">Delete</v-btn>
            </div>
            <!--
            <v-container>
                <p>Animations:</p>
                <v-btn @click="addAnimation(group as Group)">Add</v-btn>
                <v-row v-for="animation in store.animations" :key="animation.name" justify="center">
                    <p>{{ animation.name }}</p><v-btn
                        @click="editAnimation(animation as Animation, group as Group)">Edit</v-btn><v-btn
                        @click="deleteAnimation(animation as Animation)">Delete</v-btn>
                </v-row>
                <v-divider v-if="store.groups.indexOf(group) < store.groups.length - 1" />
            </v-container>
            -->
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

    <!--
    <v-dialog v-model="animationDialog" width="80%">
        <v-card>
            <v-card-text>
                <v-text-field v-model="animationDialogAnimation!.name" placeholder="Name"></v-text-field>
                <div class="timeline" style="position: relative; display: flex; width: 100%">
                    <div id="outline" style="height: 500px;">
                        <div v-for="fixture in animationDialogGroup?.members">
                            <div v-for="(n, channel) in fixture.numChannels">
                                <p>{{ fixture.name }} / {{ channel + 1}} <v-btn @click="addKeyframe(fixture, channel)">Add Keyframe</v-btn></p>
                            </div>
                        </div>
                    </div>
                    <div id="keyframes" style="height: 500px; flex-grow: 1;"></div>
                </div>
            </v-card-text>
            <v-card-actions>
                <v-btn v-if="animationDialogUpdating" color="primary" block
                    @click="saveAnimation(); animationDialog = false">Speichern</v-btn>
                <v-btn v-if="!animationDialogUpdating" color="primary" block
                    @click="createAnimation(); animationDialog = false">Hinzufügen</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    -->
</template>

<script setup lang="ts">
import Fixture from '@/models/Fixture';
import Group from '@/models/Group';
import { useDmxStore } from '@/stores/dmx';
import { ref } from 'vue';
// import Animation from '@/models/Animation';
// import { Timeline } from 'animation-timeline-js';

const store = useDmxStore();

let editingGroup = ref(new Group(''));
let editingGroupMembers = ref([] as Fixture[]);
let editing = ref(false);

let groupEditDialog = ref(false);

// let animationDialog = ref(false);
// let animationDialogAnimation = ref<Animation | null>();
// let animationDialogUpdating = ref(false);
// let animationDialogGroup = ref<Group | null>();
// let animationDialogTimeline: Timeline | null = null;

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

function setEditingMembershipValue(v: boolean, f: Fixture) {
    if (v) {
        editingGroupMembers.value.push(f);
    } else {
        editingGroupMembers.value.splice(editingGroupMembers.value.indexOf(f));
    }
}

// function addAnimation(group: Group) {
//     animationDialogUpdating.value = false;
//     animationDialog.value = true;
//     animationDialogAnimation.value = new Animation("", group);
//     animationDialogGroup.value = group;
//     initTimeline(group);
// }

// function initTimeline(group: Group) {
//     setTimeout(() => {
//         const model: any = { rows: [] }
//         group.members.forEach(x => {
//             if (!animationDialogAnimation.value!.keyframes.has(x)) {
//                 const map = new Map();
//                 for (let i = 0; i < x.numChannels; i++) {
//                     map.set(i, []);
//                 }
//                 animationDialogAnimation.value!.keyframes.set(x, map)
//             }
//         });
//         for (let [fixture, map] of animationDialogAnimation.value!.keyframes) {
//             for (let [number, keyframes] of map) {
//                 model.rows.push(keyframes);
//             }
//         }
//         animationDialogTimeline = new Timeline({ id: 'keyframes' });
//         animationDialogTimeline.setModel(model);
//     }, 500)
// }

// function addKeyframe(fixture: Fixture, channel: number) {
//     const model = animationDialogTimeline?.getModel();
//     model?.rows[channel].keyframes?.push({val: animationDialogTimeline!.getTime(), value: 0});
//     animationDialogTimeline?.setModel(model);
// }

// function editAnimation(animation: Animation, group: Group) {
//     animationDialogUpdating.value = true;
//     animationDialogAnimation.value = animation;
//     animationDialog.value = true;
//     animationDialogGroup.value = group;
//     initTimeline(group);
// }

// function deleteAnimation(animation: Animation) {
//     const index = store.animations.indexOf(animation);
//     store.animations.splice(index, 1);
//     store.persistState();
// }

// function createAnimation() {
//     store.animations.push(animationDialogAnimation.value!);
//     store.persistState();
// }

// function saveAnimation() {
//     store.persistState();
// }
</script>
