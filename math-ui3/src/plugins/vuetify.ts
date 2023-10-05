/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

import {
  VDataTable,
} from "vuetify/labs/VDataTable";

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  components: {
    VDataTable,
  },
  theme: {
    themes: {
      light: {
        colors: {
          primary: "#202750",
          secondary: "#009688",
          accent: "#cddc39",
          error: "#f44336",
          warning: "#ffc107",
          info: "#607d8b",
          success: "#00bcd4",
          // primary: "#1867C0",
          // secondary: "#5CBBF6",
        },
      },
    },
  },
});
