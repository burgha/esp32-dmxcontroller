<template>
    <div class="home">
        <h1>Groups</h1>
        <input type="text" v-model="formGroup.name">
        <button @click="addOrSave()">{{editing ? "Save" : "Add"}}</button>
        <hr>
        <div v-for="group in groups" :key="group.name">
            {{group.name}} <span @click="edit(group)">E</span>    <span @click="remove(group)">X</span>
            <div v-for="fixture in fixtures" :key="fixture.name">
                <label :for="fixture.name">{{fixture.name}}</label>
                <input type="checkbox" :name="fixture.name" @click="toggleMembership(group, fixture)" :checked="isFixtureInGroup(group, fixture)">
            </div>
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
