
// Plugins
import { loadFonts } from "./webfontloader";
import vuetify from "./vuetify";
import store from "../store/pinia/indexStore";
import router from "../router";
import { createGtag } from "vue-gtag";
import { seoConfig } from "../config/seoConfig";

// Types
import type { App } from "vue";

export function registerPlugins(app: App) {
  loadFonts();
  app.use(store).use(vuetify).use(router);

  const gtag = createGtag({
    tagId:
      import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() ||
      seoConfig.analytics.googleAnalyticsId,
    appName: "Mathboard",
  });
  app.use(gtag);
}
