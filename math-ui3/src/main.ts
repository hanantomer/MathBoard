/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Composables
import { createApp } from "vue";

import useApiHelper from "./helpers/apiHelper";

// Plugins
import { registerPlugins } from "./plugins";
// Components
import App from "./App.vue";

const apiHelper = useApiHelper();

const app = createApp(App);

app.config.errorHandler = (err: any, vm: any, info: any) => {
  const message = err.stack;
  console.error(message);
  apiHelper.log(message);
};

registerPlugins(app);

app.mount("#app");
