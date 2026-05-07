import { version } from "./package.json";
import { cdnMock } from "./src/plugins/cdn-mock.plugin";
import { stringify } from "safe-stable-stringify";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [
		tsconfigPaths(),

		cdnMock(),
	],
	test: {
		environment: "node",
		setupFiles: ["./tests/core/matchers.ts"],
		clearMocks: true,
	},

	define: {
		__PKG_VERSION__: stringify(version),
	},
});
