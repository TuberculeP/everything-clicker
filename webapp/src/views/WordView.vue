<template>
  <div v-if="notFound" class="flex flex-1 items-center justify-center">
    <p>{{ t("word.notFound") }}</p>
  </div>
  <div v-else-if="!word" class="flex flex-1 items-center justify-center">
    <p>{{ t("word.loading") }}</p>
  </div>
  <div v-else class="flex flex-1 flex-col items-center justify-center gap-4">
    <h1 class="text-2xl text-center break-all max-w-full px-4">
      <span dir="auto">{{ word.word }}</span> ({{ word.count + pending }})
    </h1>
    <button
      class="bg-clicker hover:bg-clicker-hover text-clicker-foreground font-bold py-4 px-8 rounded-full aspect-square text-4xl transition-transform active:scale-90"
      @click="click"
    >
      {{ t("word.increase") }}
    </button>
    <template v-if="isDev">
      <p>{{ t("word.totalAtBatch", { count: totalAtBatch }) }}</p>
      <p>{{ t("word.clicksSinceBatch", { count: pending }) }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useClickBatch } from "../composables/useClickBatch";

const { t } = useI18n();
const route = useRoute();
const isDev = import.meta.env.DEV;

const id = computed(() => String(route.params.id));
const { word, notFound, pending, totalAtBatch, click } = useClickBatch(id);
</script>
