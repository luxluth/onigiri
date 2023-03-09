import { defineConfig } from 'tsup'

export default defineConfig({
    entry : ["src"],
    format: ["cjs", "esm"],
    treeshake: true,
    dts: true,
})