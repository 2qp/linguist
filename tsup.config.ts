import { defineConfig } from "tsup";

const config = defineConfig({
	entry: ["src/generated/**/*.ts"],
	clean: true,
	format: ["esm", "cjs"],
	dts: true,
	treeshake: true,
	minify: true,
	splitting: true,
	loader: {
		".json": "copy",
	},
	target: "es2020",
});

export default config;
