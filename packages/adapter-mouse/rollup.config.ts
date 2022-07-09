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
            name: "gameInputMouse",
            plugins: [terser()],
            globals: { "@game-input/core": "gameInput" },
        },
    ],
    plugins: [typescript({ tsconfig: "./tsconfig.json" })],
    external: ["@game-input/core"],
};
