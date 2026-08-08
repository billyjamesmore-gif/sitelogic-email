import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  // React/react-dom are peer deps supplied by the consuming app; don't bundle.
  external: ["react", "react-dom"],
});
