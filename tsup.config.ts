// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'], // Your main entry point
  splitting: true, // Enable code splitting if you have multiple entry points or large files
  sourcemap: true, // Generate source maps for debugging
  clean: true, // Clean the dist directory before building
  dts: true, // generate type definition files
  format: ['cjs', 'esm'], // Output both CommonJS and ES Modules
  target: 'es2020', // Target a specific ECMAScript version
  minify: true, // enable minification
  bundle: true, // bundle dependencies.
  skipNodeModulesBundle: true, // Don't bundle node_modules
  shims: true, // support browser apis if needed
});
