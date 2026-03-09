// ESLint flat config for Node.js 20+ app
// Migrated from .eslintrc.json (env: node, es2022; extends: eslint:recommended)

const js = require("@eslint/js");

/** @type {import("eslint").Linter.FlatConfig[]} */
module.exports = [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        console: "readonly",
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        setImmediate: "readonly",
        clearImmediate: "readonly",
        require: "readonly",
        module: "readonly",
        exports: "readonly",
      },
    },
  },
  js.configs.recommended,
];

