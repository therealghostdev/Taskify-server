import { browser } from "globals";
import eslintRecommended from "@eslint/eslint-plugin/dist/configs/recommended";
import typescriptEslintRecommended from "typescript-eslint/dist/recommended";

export default {
  languageOptions: { globals: { browser } },
  extends: [eslintRecommended, "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    // Additional rules can be added here
  },
};
