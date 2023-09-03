/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Composables
import { createApp } from 'vue'
import { createPinia } from "pinia";
// Plugins
import { registerPlugins } from './plugins'
// Components
import App from './App.vue'

import  store  from "./store/pinia/indexStore";

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);

registerPlugins(app)

app.use(store);
app.mount('#app')
