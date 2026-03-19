import pluginVue from "eslint-plugin-vue";
import prettier from "eslint-config-prettier";

export default [
  ...pluginVue.configs["flat/essential"],
  prettier,
  {
    rules: {
      "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**"],
  },
];
