/**
 * plugins/index.ts
 *
 * Automatically included in `./build/main.ts`
 */
// Plugins
import { loadFonts } from "./webfontloader";
import vuetify from "./vuetify";
import pinia from "../store/pinia/indexStore";
import router from "../router";
export function registerPlugins(app) {
    loadFonts();
    app.use(pinia).use(vuetify).use(router);
}
//# sourceMappingURL=index.js.map