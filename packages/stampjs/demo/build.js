import { build } from "esbuild";

build({
  entryPoints: ["./src/index.js"],
  outdir: "./",
  minify: false,
  bundle: true,
  format: 'esm'
})