import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    viewportHeight: 1200,
    viewportWidth: 1900,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
