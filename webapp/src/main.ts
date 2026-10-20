import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router.ts";
import { i18n } from "./lib/lang/index.ts";
import { createPinia } from "pinia";
import "./assets/xp.css";
import "./assets/index.css";

const pinia = createPinia();

createApp(App).use(router).use(i18n).use(pinia).mount("#app");
