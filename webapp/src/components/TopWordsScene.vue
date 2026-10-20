<template>
  <div class="window grid grid-rows-[auto_1fr] w-[300px] h-[200px]">
    <div class="title-bar">
      <div class="title-bar-text">{{ t("top.window") }}</div>
    </div>
    <div ref="container" class="relative w-full h-full overflow-hidden" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import sortBy from "lodash/sortBy";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  CSS2DObject,
  CSS2DRenderer,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { useTopWordsStore } from "../stores/topWordsStore";

const RING_RADIUS = 5;
const SPHERE_COLOR = "#3B82F6";

const { t } = useI18n();
const { normalized } = storeToRefs(useTopWordsStore());

const container = ref<HTMLDivElement>();

let renderer: THREE.WebGLRenderer | null = null;
let labelRenderer: CSS2DRenderer | null = null;
let controls: OrbitControls | null = null;
let resizeObserver: ResizeObserver | null = null;
let frame = 0;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
const spheres = new THREE.Group();
const sphereMaterial = new THREE.MeshStandardMaterial({ color: SPHERE_COLOR });

const torus = new THREE.Mesh(
  new THREE.TorusGeometry(RING_RADIUS, 0.01, 16, 100),
  new THREE.MeshStandardMaterial({ color: "black" }),
);
torus.rotation.x = Math.PI / 2;

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(10, 10, 10);
scene.add(torus, spheres, new THREE.AmbientLight(0xffffff, 5), pointLight);

function clearSpheres() {
  for (const group of [...spheres.children]) {
    group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) obj.geometry.dispose();
      // The label renderer keeps CSS2DObject DOM nodes around otherwise
      if (obj instanceof CSS2DObject) obj.element.remove();
    });
    spheres.remove(group);
  }
}

function buildSpheres(data: { id: string; word: string; value: number }[]) {
  clearSpheres();
  // Sorted by id so a word keeps its slot on the ring when ranks change
  const sorted = sortBy(data, "id");
  sorted.forEach(({ word, value: scale }, index) => {
    const angle = (index / sorted.length) * 2 * Math.PI;
    const group = new THREE.Group();
    group.position.set(
      RING_RADIUS * Math.cos(angle),
      0,
      RING_RADIUS * Math.sin(angle),
    );

    group.add(
      new THREE.Mesh(new THREE.SphereGeometry(scale, 15, 15), sphereMaterial),
    );

    // CSS2D labels always face the camera, like drei's <Billboard>
    const label = document.createElement("span");
    label.textContent = word;
    label.dir = "auto";
    label.className = "block max-w-32 truncate text-sm text-foreground";
    const labelObject = new CSS2DObject(label);
    labelObject.position.set(0, scale + 0.5, 0);
    group.add(labelObject);

    spheres.add(group);
  });
}

function resize() {
  const el = container.value;
  if (!el || !renderer || !labelRenderer) return;
  const { clientWidth: width, clientHeight: height } = el;
  if (!width || !height) return;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  labelRenderer.setSize(width, height);
}

function animate() {
  frame = requestAnimationFrame(animate);
  if (renderer && labelRenderer) {
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  }
}

onMounted(() => {
  const el = container.value!;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  el.appendChild(renderer.domElement);

  labelRenderer = new CSS2DRenderer();
  Object.assign(labelRenderer.domElement.style, {
    position: "absolute",
    inset: "0",
    pointerEvents: "none",
  });
  el.appendChild(labelRenderer.domElement);

  camera.position.set(3, 3, 7);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 5;
  controls.maxDistance = 20;

  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(el);
  resize();

  buildSpheres(normalized.value);
  animate();
});

watch(normalized, buildSpheres);

onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  resizeObserver?.disconnect();
  controls?.dispose();
  clearSpheres();
  renderer?.dispose();
  renderer?.domElement.remove();
  labelRenderer?.domElement.remove();
  renderer = null;
  labelRenderer = null;
});
</script>
