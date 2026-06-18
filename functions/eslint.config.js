const js = require("@eslint/js");

module.exports = [
  {
    ignores: ["node_modules/**", "**/*.spec.*"],
  },
  {
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        require: "readonly",
        module: "writable",
        exports: "writable",
        __dirname: "readonly",
        __filename: "readonly",
        process: "readonly",
        console: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
];
