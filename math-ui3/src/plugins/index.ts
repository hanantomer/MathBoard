
// Plugins
import { loadFonts } from "./webfontloader";
import vuetify from "./vuetify";
import store from "../store/pinia/indexStore";
import router from "../router";

// Types
import type { App } from "vue";

export function registerPlugins(app: App) {
  loadFonts();
  app.use(store).use(vuetify).use(router);
}
