<template>
    <v-sheet class="ma-4 pa-4 rounded-lg" elevation="2" :color="active ? 'blue' : 'white'" style="width: 150px; height: 150px">
        {{ title }}
    </v-sheet>
</template>

<script setup lang="ts">
    const props = defineProps({
        title: String,
        active: Boolean
    })
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
