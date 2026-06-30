import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Reference-only template source (bullseye/04). Read, not linted/shipped.
    "template_repos/**",
    // Spec + reference skeletons (bullseye/). Documentation, not shipped source.
    "bullseye/**",
  ]),
  {
    // R3F scene setup generates geometry with Math.* inside useMemo (idiomatic).
    // The React Compiler purity rule flags this; it is intentional and stable.
    files: [
      "src/components/3d/**/*.{ts,tsx}",
      "src/components/backgrounds/**/*.{ts,tsx}",
    ],
    rules: {
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "warn",
      // The provided react-force-graph-3d component is untyped at its boundary.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
]);

export default eslintConfig;
