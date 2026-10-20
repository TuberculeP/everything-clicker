<template>
  <div
    class="h-screen max-h-screen w-screen max-w-screen grid grid-rows-[auto_1fr] bg-foreground antialiased"
  >
    <header
      class="bg-foreground text-background p-4 grid items-center grid-cols-[1fr_2fr_1fr]"
    >
      <div>
        <AudioPlayer />
      </div>
      <div class="flex justify-center">
        <RouterLink :to="{ name: 'home' }" class="flex items-center gap-8">
          <img src="/img/finger-click.gif" alt="" width="50" class="block" />
          <h1 class="text-4xl font-title cursor-pointer">
            {{ t("app.title") }}
          </h1>
          <img src="/img/finger-click.gif" alt="" width="50" class="block" />
        </RouterLink>
      </div>
      <div class="flex justify-end">
        <button
          class="text-xs flex items-center gap-2 cursor-pointer"
          @click="sombre = !sombre"
        >
          {{ sombre ? t("layout.lightMode") : t("layout.darkMode") }}
          <img src="/img/sun.gif" alt="" />
        </button>
      </div>
    </header>

    <div v-if="!sombre" class="grid grid-cols-[1fr_auto] bg-background min-h-0">
      <main class="grid grid-rows-[1fr_auto] min-h-0 overflow-auto">
        <div class="flex flex-col">
          <slot />
        </div>
        <footer class="bg-foreground text-background p-4">
          <p class="text-center">
            {{ t("layout.footer") }}
            <a
              class="underline"
              href="https://www.google.com/search?q=Daniel%20Pennac"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ t("layout.footerLink") }}
            </a>
          </p>
        </footer>
      </main>
      <aside class="w-fit bg-muted overflow-auto">
        <TopWords />
      </aside>
    </div>
    <div v-else class="w-full h-full flex items-center justify-center">
      <img src="/img/eyes.gif" alt="" />
    </div>

    <Toaster position="bottom-left" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import AudioPlayer from "@/components/AudioPlayer.vue";
import TopWords from "@/components/TopWords.vue";
import { Toaster } from "@/components/ui/sonner";

const { t } = useI18n();

// Joke "dark mode": hides the whole page behind a gif, not a real theme
const sombre = ref(false);
</script>
