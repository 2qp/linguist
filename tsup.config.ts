import { version } from "./package.json";
import { dynamicPathNormalizePlugin } from "./src/plugins/dynamic-path-normalize.plugin";
import { postPatchChunks } from "./src/plugins/post-patch-chunks.plugin";
import { stringify } from "safe-stable-stringify";
import { defineConfig } from "tsup";

const config = defineConfig({
	entry: ["src/generated/**/*.ts"],
	clean: true,
	format: ["esm", "cjs"],
	dts: true,
	treeshake: true,
	minify: true,
	minifyWhitespace: true,
	minifyIdentifiers: true,
	minifySyntax: true,
	splitting: true,
	loader: {
		".json": "copy",
	},
	target: "es2020",

	esbuildPlugins: [
		dynamicPathNormalizePlugin({
			includeDir: "src/generated/data/indexes",
			filePattern: /^dynamic-by-.*\.ts$/,
			variablePattern: /dynamic_by_\w+/,
			pathPattern: /^\$\{T\d+\}/,
		}),
	],

	esbuildOptions(options, context) {
		options.define = {
			...options.define,
			"process.env.CURRENT_FORMAT": `"${context.format}"`,
		};
	},

	onSuccess: async () => {
		await postPatchChunks();
	},

	define: {
		__PKG_VERSION__: stringify(version),
	},
});

export default config;
