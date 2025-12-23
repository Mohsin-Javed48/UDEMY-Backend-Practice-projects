import js from "@eslint/js";
import globals from "globals";

export default [
    js.configs.recommended,

    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "commonjs",
            globals: {
                ...globals.node,   // replaces env: { node: true }
            },
        },

        rules: {
            quotes: ["error", "single"],
            semi: ["error", "always"],
        },
    },
];
