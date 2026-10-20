import { createRouter, createWebHistory } from "vue-router";
import HomeView from "./views/HomeView.vue";

const routes = [
  { path: "/", component: HomeView, name: "home" },
  {
    path: "/w/:id",
    component: () => import("./views/WordView.vue"),
    name: "word",
  },
  {
    path: "/:pathMatch(.*)*",
    component: () => import("./views/NotFoundView.vue"),
    name: "not-found",
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
