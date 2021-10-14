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

        <div v-for="group in groups" :key="group.name">
            <p class="text-h6">{{ group.name }}</p>
            <v-btn class="ma-2" @click="edit(group)">Edit</v-btn>
            <v-btn class="ma-2" @click="remove(group)">Delete</v-btn>
            <v-container>
                <p>Members:</p>
                <v-row v-for="fixture in fixtures" :key="fixture.name" justify="center">
                    <v-col cols="4">
                        <v-checkbox
                            class="align-center justify-center"
                            :input-value="isFixtureInGroup(group, fixture)"
                            :label="fixture.name"
                            @click="toggleMembership(group, fixture)"
                        />
                    </v-col>
                </v-row>
                <v-divider v-if="groups.indexOf(group) < groups.length - 1" />
            </v-container>
        </div>
    </div>
</template>

<script lang="ts">
import Fixture from '@/models/Fixture';
import Group from '@/models/Group';
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
    components: {
    }
})
export default class Groups extends Vue {
    private formGroup = new Group('');
    private editing = false;

    get groups(): Group[] {
        return this.$store.state.groups; 
    }

    get fixtures(): Fixture[] {
        return this.$store.state.fixtures; 
    }

    addOrSave(): void {
        if (this.editing) {
            this.save();
        } else {
            this.add();
        }
    }

    add(): void {
        if (this.formGroup.name === '') {
            return;
        }
        this.groups.push(this.formGroup);
        this.formGroup = new Group('');
        this.$store.dispatch('persistState');
    }

    edit(group: Group): void {
        this.formGroup = group;
        this.editing = true;
    }

    save(): void {
        this.formGroup = new Group('');
        this.editing = false;
        this.$store.dispatch('persistState');
    }

    remove(group: Group): void {
        this.groups.splice(this.groups.indexOf(group), 1);
        this.$store.dispatch('persistState');
    }

    toggleMembership(group: Group, fixture: Fixture): void {
        if (this.isFixtureInGroup(group, fixture)) {
            group.members.splice(group.members.indexOf(fixture), 1);
        } else {
            group.members.push(fixture);
        }
        this.$store.commit("setGroups", this.groups);
        this.$store.dispatch('persistState');
    }

    isFixtureInGroup(group: Group, fixture: Fixture): boolean {
        return group.members.includes(fixture);
    }
}
</script>
