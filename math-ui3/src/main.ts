/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Composables
import { createApp } from "vue";

import useApiHelper from "./helpers/apiHelper";

import vue3GoogleLogin from "vue3-google-login";

// Plugins
import { registerPlugins } from "./plugins";
// Components
import App from "./App.vue";

import { configure } from "vue-gtag";

const apiHelper = useApiHelper();

const app = createApp(App);

configure({
  tagId: "AW-18006829563",
});

app.use(vue3GoogleLogin, {
  clientId:
    "468882561891-2becp92jqb5mgd26a788nl0tv6ajak63.apps.googleusercontent.com",
});

app.config.errorHandler = (err: any, vm: any, info: any) => {
  const message = err.stack;
  console.error(message);
  apiHelper.log(message);
};

registerPlugins(app);

app.mount("#app");
