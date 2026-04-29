export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'vite.config.js', 'eslint.config.js']
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        Notification: "readonly",
        navigator: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        confirm: "readonly",
        alert: "readonly",
        console: "readonly",
        Date: "readonly"
      }
    },
    rules: {
      'no-unused-vars': 'off'
    }
  }
];
