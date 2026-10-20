<template>
  <div>
    <TopWordsScene />
    <ul class="tree-view space-y-2">
      <li
        v-for="{ id, word, count, rank } in top"
        :key="id"
        class="grid grid-cols-[auto_1fr_auto] gap-2"
      >
        <span>{{ rank }}</span>
        <RouterLink :to="{ name: 'word', params: { id } }" class="max-w-48">
          {{ word }}
        </RouterLink>
        <span>({{ count }})</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { storeToRefs } from "pinia";
import { useTopWordsStore } from "../stores/topWordsStore.ts";

// three.js is heavy: keep it out of the main chunk
const TopWordsScene = defineAsyncComponent(() => import("./TopWordsScene.vue"));

const { top } = storeToRefs(useTopWordsStore());
</script>
