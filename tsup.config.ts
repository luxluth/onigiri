import { defineConfig } from 'tsup'

export default defineConfig({
    entry : [
        "src/index.ts", 
        "src/menu/index.ts", 
        "src/api/subtitles/index.ts",
        "src/api/subtitles/parsing.ts", 
        "src/api/video/index.ts", 
        "src/plugin/index.ts"
    ],
    format: ["cjs", "esm"],
    treeshake: true,
    dts: true,
    outDir : "."
})