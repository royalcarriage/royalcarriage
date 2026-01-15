module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  ignorePatterns: [
    "dist/",
    "build/",
    "node_modules/",
    ".next/",
    "out/",
    "coverage/",
    "**/.astro/**",
    "**/.next/**",
    "**/_next/**",
    "**/.output/**",
    "**/dist/**",
    "**/build/**",
    "pnpm-lock.yaml",
  ],
  rules: {
    "no-console": [
      "warn",
      {
        allow: ["warn", "error"],
      },
    ],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/explicit-module-boundary-types": "off",
  },
  globals: {
    React: "writable",
    JSX: "readonly",
    Express: "readonly",
  },
};
