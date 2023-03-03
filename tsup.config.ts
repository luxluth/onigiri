import { defineConfig } from 'tsup'

export default defineConfig({
    entry : ["src/index.ts", "src/menu/index.ts"],
    format: ["cjs", "esm"],
    treeshake: true,
    dts: true,
})