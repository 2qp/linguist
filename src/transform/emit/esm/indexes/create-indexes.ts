import { emitIndexByExtension } from "./emit-index-by-extension";
import { emitIndexById } from "./emit-index-by-id";
import { emitLazyIndexByExtension } from "./emit-lazy-index-by-extension";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ensureDir } from "@utils/ensure-dir";

import type { Languages } from "@/generated/types/language-types.generated";
import type { Config } from "@/types/config.types";
import type { IndexEmitter } from "./types";

type CreateIndexesParams = {
	languages: Languages;
	config: Config;
};

type CreateIndexesType = (params: CreateIndexesParams) => Promise<void>;

const createIndexes: CreateIndexesType = async ({ languages, config }) => {
	//

	const indexesDir = join(config.data.paths.esmDir, "indexes");
	await ensureDir(indexesDir);

	const indexEmitters: IndexEmitter[] = [
		{ name: "by-id", emitter: emitIndexById },
		{ name: "by-extension", emitter: emitIndexByExtension },

		{ name: "lazy-by-extension", emitter: emitLazyIndexByExtension },
	];

	await Promise.all(
		indexEmitters.map(async ({ name, emitter }) => {
			const filePath = join(indexesDir, `${name}.ts`);
			const content = emitter({ languages, config });
			await writeFile(filePath, content);
		}),
	);
};

export { createIndexes };
export type { CreateIndexesParams, CreateIndexesType };
