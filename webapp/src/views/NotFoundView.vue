<template>
  <div class="flex flex-1 flex-col items-center justify-center gap-4">
    <h1 class="text-4xl">{{ t("notFound.title") }}</h1>
    <RouterLink :to="{ name: 'home' }" class="underline">
      {{ t("notFound.back") }}
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
