<template>
    <div class="button" v-bind:class="{active: active}">
        {{title}}
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

@Component
export default class Button extends Vue {
    @Prop(String) title: string | undefined;
    @Prop(Boolean) active: boolean | undefined;
}
</script>

<style scoped>
    .button {
        margin: 10px;
        display: inline-block;
        width: 100px;
        height: 100px;
        border-radius: 10px;
        background: white;
        border: 1px solid black;
    }

    .button.active {
      background: cornflowerblue;
    }
</style>
