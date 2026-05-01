import { readFile } from "node:fs/promises";
import { basename, relative } from "node:path";
import { isNullish } from "@utils/guards";
import MagicString from "magic-string";

import type { Format, Options } from "tsup";

type Plugin = NonNullable<Options["esbuildPlugins"]>[number];

type PluginOptions = {
	includeDir: string;
	filePattern: RegExp;
	variablePattern: RegExp;
	pathPattern: RegExp;
};

const EXTENSION_MAP = {
	esm: ".js",
	cjs: ".cjs",
	iife: ".js",
} as const satisfies Record<Format, string>;

// const TARGET_DIRS = [
// 	"./data/languages/data/",
// 	"./data/languages/markup/",
// 	"./data/languages/programming/",
// 	"./data/languages/prose/",
// ] as const;

const dynamicPathNormalizePlugin = (options: PluginOptions): Plugin => ({
	name: "dynamic-path-normalize",
	setup(build) {
		const { includeDir, filePattern, variablePattern } = options;

		const format = build.initialOptions.define?.["process.env.CURRENT_FORMAT"]?.replace(/"/g, "") as Format;

		build.onLoad({ filter: /\.(ts|js|mts|cjs)$/ }, async (args) => {
			//

			const currentFormat = format || "esm";
			const extension = EXTENSION_MAP[currentFormat] || ".js";

			const relativeFilePath = relative(process.cwd(), args.path);
			const fileName = basename(relativeFilePath);

			if (!relativeFilePath.startsWith(includeDir)) return;

			if (!filePattern.test(fileName)) return;

			const code = await readFile(args.path, "utf8");

			if (!variablePattern.test(code)) return;

			const ms = new MagicString(code);

			const blockRegex = new RegExp(
				`(${variablePattern.source})\\s*(?::\\s*[\\w<>|\\s]+)?\\s*=\\s*([\\s\\S]*?)(?=;\\s*(?:export|const|let|var|$))`,
				"g",
			);

			const blockMatches = [...code.matchAll(blockRegex)];

			//

			for (const blockMatch of blockMatches) {
				//

				const blockContent = blockMatch[2];
				if (isNullish(blockContent)) continue;

				const blockStartIndex = blockMatch.index + blockMatch[0].indexOf(blockContent);

				const stringRegex = /(['"`])(.*?)\1/g;
				const stringMatches = [...blockContent.matchAll(stringRegex)];

				for (const stringMatch of stringMatches) {
					//

					const originalString = stringMatch[2];
					if (isNullish(originalString)) continue;

					// const isTargetDir = TARGET_DIRS.some((dir) => originalString.startsWith(dir));
					const isTargetPath = options.pathPattern.test(originalString);

					if (isTargetPath && !originalString.endsWith(extension)) {
						//

						const base = originalString.endsWith(".")
							? originalString.slice(0, -1)
							: originalString.replace(/\.(js|cjs)$/, "");

						const normalizedPath = base + extension;

						const start = blockStartIndex + stringMatch.index + 1;
						const end = start + originalString.length;

						ms.overwrite(start, end, normalizedPath);
					}
				}
			}

			return {
				contents: ms.toString(),
				loader: args.path.endsWith(".ts") ? "ts" : "js",
			};
		});
	},
});

export { dynamicPathNormalizePlugin };
