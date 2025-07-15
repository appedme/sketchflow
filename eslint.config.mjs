import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "off",
      "no-unused-vars": "off",
      "react/jsx-key": "off",
      "react/display-name": "off",
      "@next/next/no-img-element": "off",
      "react/no-unknown-property": ["error", {
        ignore: ["css", "jsx"],
      }],
    },
  },
];

export default eslintConfig;
