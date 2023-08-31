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

                <p>Animations:</p>
                <v-btn @click="addAnimation(group as Group)">Add</v-btn>
                <v-row v-for="animation in store.animations" :key="animation.name" justify="center">
                    <p>{{ animation.name }}</p><v-btn
                        @click="editAnimation(animation as Animation, group as Group)">Edit</v-btn><v-btn
                        @click="deleteAnimation(animation as Animation)">Delete</v-btn>
                </v-row>
                <v-divider v-if="store.groups.indexOf(group) < store.groups.length - 1" />
            </v-container>
        </div>
    </div>

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
</template>

<script setup lang="ts">
import Fixture from '@/models/Fixture';
import Group from '@/models/Group';
import { useDmxStore } from '@/stores/dmx';
import { ref } from 'vue';
import Animation from '@/models/Animation';
import { Timeline } from 'animation-timeline-js';

const store = useDmxStore();

let formGroup = ref(new Group(''));
let editing = ref(false);

let animationDialog = ref(false);
let animationDialogAnimation = ref<Animation | null>();
let animationDialogUpdating = ref(false);
let animationDialogGroup = ref<Group | null>();
let animationDialogTimeline: Timeline | null = null;

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
    return group.members.find(x => x.name === fixture.name) !== undefined;
}

function addAnimation(group: Group) {
    animationDialogUpdating.value = false;
    animationDialog.value = true;
    animationDialogAnimation.value = new Animation("", group);
    animationDialogGroup.value = group;
    initTimeline(group);
}

function initTimeline(group: Group) {
    setTimeout(() => {
        const model: any = { rows: [] }
        group.members.forEach(x => {
            if (!animationDialogAnimation.value!.keyframes.has(x)) {
                const map = new Map();
                for (let i = 0; i < x.numChannels; i++) {
                    map.set(i, []);
                }
                animationDialogAnimation.value!.keyframes.set(x, map)
            }
        });
        for (let [fixture, map] of animationDialogAnimation.value!.keyframes) {
            for (let [number, keyframes] of map) {
                model.rows.push(keyframes);
            }
        }
        animationDialogTimeline = new Timeline({ id: 'keyframes' });
        animationDialogTimeline.setModel(model);
        console.log(animationDialogAnimation);
    }, 500)
}

function addKeyframe(fixture: Fixture, channel: number) {
    const model = animationDialogTimeline?.getModel();
    model?.rows[channel].keyframes?.push({val: animationDialogTimeline!.getTime(), value: 0});
    animationDialogTimeline?.setModel(model);
    console.log(model);
}

function editAnimation(animation: Animation, group: Group) {
    animationDialogUpdating.value = true;
    animationDialogAnimation.value = animation;
    animationDialog.value = true;
    animationDialogGroup.value = group;
    initTimeline(group);
}

function deleteAnimation(animation: Animation) {
    const index = store.animations.indexOf(animation);
    store.animations.splice(index, 1);
    store.persistState();
}

function createAnimation() {
    store.animations.push(animationDialogAnimation.value!);
    store.persistState();
}

function saveAnimation() {
    store.persistState();
}
</script>
