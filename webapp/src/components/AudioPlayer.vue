<template>
  <Button
    v-if="!proMode"
    variant="secondary"
    class="font-bold"
    @click="proMode = true"
  >
    {{ t("player.proMode") }}
  </Button>
  <div v-else class="space-y-1">
    <p>{{ t("player.nowPlaying", { track: tracks[trackIndex] }) }}</p>
    <div class="flex gap-1 text-foreground">
      <button :aria-label="t('player.previous')" @click="prevTrack">
        <SkipBack class="size-4" />
      </button>
      <button
        :aria-label="isPlaying ? t('player.pause') : t('player.play')"
        @click="togglePlay"
      >
        <Pause v-if="isPlaying" class="size-4" />
        <Play v-else class="size-4" />
      </button>
      <button :aria-label="t('player.next')" @click="nextTrack">
        <SkipForward class="size-4" />
      </button>
    </div>
    <div class="flex items-center gap-2">
      <label for="volume">{{ t("player.volume") }}</label>
      <input
        id="volume"
        v-model.number="volume"
        type="range"
        min="0"
        max="1"
        step="0.01"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import random from "lodash/random";
import { Pause, Play, SkipBack, SkipForward } from "lucide-vue-next";
import { Button } from "@/components/ui/button";

const tracks = [
  "Graveyard",
  "Life",
  "Lost Memories",
  "Midnight",
  "Nights & Fogs",
  "The Maze",
  "The World's End",
  "Tribe",
  "Wake Up",
];

const { t } = useI18n();

const proMode = ref(false);
const trackIndex = ref(random(tracks.length - 1));
const isPlaying = ref(false);
const volume = ref(1);

let audio: HTMLAudioElement | null = null;

const trackUrl = (index: number) =>
  `/audio/${encodeURIComponent(tracks[index])}.opus`;

function play() {
  audio?.play().catch((err) => console.error("Audio playback failed:", err));
}

function togglePlay() {
  isPlaying.value = !isPlaying.value;
}

function nextTrack() {
  trackIndex.value = (trackIndex.value + 1) % tracks.length;
  isPlaying.value = true;
}

function prevTrack() {
  trackIndex.value = (trackIndex.value - 1 + tracks.length) % tracks.length;
  isPlaying.value = true;
}

// Changing src stops playback, so restart it when a track is selected
watch(trackIndex, (index) => {
  if (!audio) return;
  audio.src = trackUrl(index);
  if (isPlaying.value) play();
});

watch(isPlaying, (playing) => {
  if (playing) play();
  else audio?.pause();
});

watch(volume, (value) => {
  if (audio) audio.volume = value;
});

onMounted(() => {
  audio = new Audio(trackUrl(trackIndex.value));
  audio.volume = volume.value;
  audio.addEventListener("ended", nextTrack);
});

onBeforeUnmount(() => {
  audio?.pause();
  audio?.removeEventListener("ended", nextTrack);
  audio = null;
});
</script>
