import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    viewportHeight: 1100,
    viewportWidth: 1800,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
