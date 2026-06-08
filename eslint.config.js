import tseslint from "typescript-eslint";

export default tseslint.config(
  ...tseslint.configs.recommended,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "dist/**",
      ".kilo/**"
    ]
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser
    },
    rules: {
      "no-unused-vars": ["error", { "varsIgnorePattern": "^(nextConfig)$", "argsIgnorePattern": "^_" }]
    }
  }
);