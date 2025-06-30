
// Plugins
import { loadFonts } from "./webfontloader";
import vuetify from "./vuetify";
import store from "../store/pinia/indexStore";
import router from "../router";
import VueGtag from "vue-gtag";

// Types
import type { App } from "vue";

export function registerPlugins(app: App) {
  loadFonts();
  app.use(store).use(vuetify).use(router);
  app.use(
    VueGtag,
    {
      config: { id: import.meta.env.VITE_GA_MEASUREMENT_ID },
      appName: "Mathboard",
      pageTrackerScreenviewEnabled: true,
    },
    router
  );
}
