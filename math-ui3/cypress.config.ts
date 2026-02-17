import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    experimentalMemoryManagement: true,
    viewportHeight: 1200,
    viewportWidth: 1900,
    setupNodeEvents(on, config) {
      on("before:browser:launch", (browser: any = {}, launchOptions) => {
        launchOptions.args.push("--js-flags=--max-old-space-size=3500"); // e.g., 3500MB
        return launchOptions;
      });
      // implement node event listeners here
    },
  },
});
