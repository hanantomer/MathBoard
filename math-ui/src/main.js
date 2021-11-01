import Vue from "vue";
import VueRouter from "vue-router";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import store from "./store/index.js";
import router from "./router/index.js";
import { LoaderPlugin } from "vue-google-login";
import VueCookies from "vue-cookies";

Vue.prototype.$client_id =
  "468882561891-2becp92jqb5mgd26a788nl0tv6ajak63.apps.googleusercontent.com";

Vue.use(VueRouter);
Vue.use(LoaderPlugin, { client_id: Vue.prototype.$client_id });
Vue.use(VueCookies);

gapi.load("client:auth2", () => {
  new Vue({
    store,
    vuetify,
    router,
    render: (createElement) => {
      return createElement(App);
    },
  }).$mount("#app");
});
