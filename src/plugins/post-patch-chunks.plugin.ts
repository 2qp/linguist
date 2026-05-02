import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { writeFile } from "@services/fs/write-file";
import { log } from "@utils/log";
import { ANSI_COLORS } from "@/constants/ansi-colors";

const dist = "./dist" as const;
const entryPaths = ["./dist/getters/client"] as const;
const exts = [".js", ".cjs"] as const;

const applyPatch = async (filePath: string, content: string): Promise<void> => {
	//

	if (!content.includes("IGNORE_WEBPACK")) return;

	const patched = content.replace(
		/import\([`"']IGNORE_WEBPACK(.*?)[`"']\)/g,
		"import(/* webpackIgnore: true */ `$1` )",
	);

	await writeFile({ filePath, content: patched });
	log.info(
		`${ANSI_COLORS.fg.green}\u2192${ANSI_COLORS.reset} patched: ${ANSI_COLORS.bright}${filePath}${ANSI_COLORS.reset}`,
	);
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

				await applyPatch(entryPath, entryContent);

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
						await applyPatch(chunkAbsolutePath, chunkContent);
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
