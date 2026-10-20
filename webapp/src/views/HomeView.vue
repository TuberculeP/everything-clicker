<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">{{ t("home.title") }}</h1>
    <p class="mb-2">{{ t("home.subtitle") }}</p>
    <Input
      v-model="newWord"
      :placeholder="t('home.placeholder')"
      maxlength="64"
      class="mb-4"
      @keydown.enter="submit"
    />
    <div class="flex flex-wrap gap-4 mb-4">
      <Button
        v-for="word in words"
        :key="word.id"
        as-child
        class="bg-clicker hover:bg-clicker-hover text-clicker-foreground font-bold"
      >
        <RouterLink :to="{ name: 'word', params: { id: word.id } }">
          {{ word.word }}
        </RouterLink>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { useWordsStore } from "../stores/wordsStore";

const { t } = useI18n();
const wordsStore = useWordsStore();
const { words } = storeToRefs(wordsStore);

const newWord = ref("");

async function submit() {
  const word = newWord.value.trim();
  if (!word) return;
  const error = await wordsStore.addWord(word);
  if (error) {
    toast.error(t("home.addError"), { description: error });
    return;
  }
  newWord.value = "";
}

onMounted(wordsStore.fetchWords);
</script>
