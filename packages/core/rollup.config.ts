import { terser } from "rollup-plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default {
    input: "src/index.ts",
    output: [
        {
            file: "dist/index.js",
            format: "cjs",
        },
        {
            file: "dist/index.mjs",
            format: "es",
        },
        {
            file: "dist/index.min.js",
            format: "iife",
            name: "gameInput",
            plugins: [terser()],
        },
    ],
    plugins: [typescript({ tsconfig: "./tsconfig.json" })],
};
