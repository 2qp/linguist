import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { writeFile } from "@services/fs/write-file";
import { clr } from "@utils/colors";
import { log } from "@utils/log";
import { patchDynamicImports } from "@/build/transforms/patch-dynamic-imports";
import { IGNORE_WEBPACK } from "@/constants/transforms";

const dist = "./dist" as const;
const entryPaths = ["./dist/getters/dynamic/client"] as const;
const exts = [".js", ".cjs"] as const;

const applyPatch = async (filePath: string, content: string, entryPath: string): Promise<void> => {
	//

	if (!content.includes(IGNORE_WEBPACK)) return;

	// const patched = content.replace(
	// 	/import\([`"']IGNORE_WEBPACK(.*?)[`"']\)/g,
	// 	"import(/* webpackIgnore: true */ `$1` )",
	// );

	const target = IGNORE_WEBPACK;
	const replacement = " webpackIgnore: true " as const;

	const patched = patchDynamicImports({ content, target, replacement });

	await writeFile({ filePath, content: patched });

	const cwd = process.cwd();

	const entry = relative(cwd, entryPath);
	const effected = relative(cwd, filePath);

	log.info(`${clr("fg.green", "\u2192")} patched: ${clr("bright", entry)} ${clr("fg.yellow", "\u2192")} ${effected}`);
};

// esbuild or sum always stripping legal magic comments.
// could be position quirks : import(/*! webpackIgnore: true */ url)
// so patching with manual post processing
const postPatchChunks = async (_dist = dist) => {
	//

	const chunkRegex = /['"](\.\.?\/.*?\/(chunk-.*?\.(?:js|cjs)))['"]/g;

	for (const targetDir of entryPaths) {
		try {
			if (!existsSync(targetDir)) continue;

			const files = await readdir(targetDir);
			const jsEntries = files.filter((f) => exts.some((ext) => f.endsWith(ext)));

			for (const entryFile of jsEntries) {
				//

				const entryPath = join(targetDir, entryFile);
				const entryContent = await readFile(entryPath, "utf8");

				await applyPatch(entryPath, entryContent, entryPath);

				const chunkMatches = [...entryContent.matchAll(chunkRegex)];

				for (const match of chunkMatches) {
					//

					const [_, relativePath, fileName] = match;
					if (!relativePath || !fileName) continue;

					const primaryPath = resolve(dirname(entryPath), relativePath);
					const chunkAbsolutePath = existsSync(primaryPath) ? primaryPath : resolve(_dist, fileName);

					const isChunkExsit = existsSync(chunkAbsolutePath);

					if (isChunkExsit) {
						const chunkContent = await readFile(chunkAbsolutePath, "utf8");
						await applyPatch(chunkAbsolutePath, chunkContent, entryPath);
					}

					if (!isChunkExsit) {
						log.warn(`couldnt locate chunk: ${fileName}`);
					}
				}
			}
		} catch (err) {
			log.error(`err: ${targetDir}:`, err);
		}
	}
};

export { postPatchChunks };
