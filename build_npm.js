import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.js"],
  outDir: "./npm",
  shims: {
    deno: true,
  },
  package: {
    name: "@marmooo/shape2path",
    version: "0.0.2",
    description: "Convert SVG basic shape (rect, circle, ellipse, line, polyline, polygon) to path.",
    license: "MIT",
    main: "mod.js",
    repository: {
      type: "git",
      url: "git+https://github.com/marmooo/shape2path.git",
    },
    bugs: {
      url: "https://github.com/marmooo/shape2path/issues",
    },
  },
  postBuild() {
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
  },
});
