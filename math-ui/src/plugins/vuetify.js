import Vue from "vue";
import Vuetify from "vuetify/lib/framework";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: "#3f51b5",
        secondary: "#009688",
        accent: "#cddc39",
        error: "#f44336",
        warning: "#ffc107",
        info: "#607d8b",
        success: "#00bcd4",
      },
    },
  },
});
