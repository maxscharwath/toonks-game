const { mergeConfig } = require("vite")
const { default: tsconfigPaths } = require('vite-tsconfig-paths')

module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: "@storybook/react",
  core: {
    "builder": "@storybook/builder-vite"
  },
  features: {
    "storyStoreV7": true
  },
  docs: {
    docsPage: "automatic"
  },
  viteFinal: async (config) => mergeConfig(config, {
    plugins: [tsconfigPaths()],
  })
};
