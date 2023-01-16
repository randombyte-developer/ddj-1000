import rollupPluginTypeScript from "rollup-plugin-typescript2";

export default {
    input: "./src/pioneer-ddj1000.ts",
    output: {
        file: "./dist/pioneer-ddj1000.js",
        format: "iife",
        name: "PioneerDdj1000"
    },
    plugins: [
        rollupPluginTypeScript({
            tsconfig: "./tsconfig.json",
            clean: true
        }),
    ],
};
