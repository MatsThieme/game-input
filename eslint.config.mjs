// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        ignores: ["**/dist"],
    },
    {
        rules: {
            curly: ["error", "all"],
            "padding-line-between-statements": ["error"],
            "@typescript-eslint/no-non-null-assertion": ["off"],
            "@typescript-eslint/no-inferrable-types": ["off"],
            "@typescript-eslint/explicit-member-accessibility": ["error"],
            "@typescript-eslint/naming-convention": [
                "error",
                {
                    selector: "memberLike",
                    format: ["camelCase"],
                    modifiers: ["private"],
                    leadingUnderscore: "require",
                    trailingUnderscore: "forbid",
                },
            ],
        },
    },
    {
        ignores: ["**/*.spec.ts", "examples/**"],
        rules: {
            "@typescript-eslint/explicit-function-return-type": ["error"],
        },
    },
);
