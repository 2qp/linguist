import { generateIndexEmitterOptions } from "./generate-index-emitter-options";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createFieldSet } from "@gen/utils/create-field-set";
import { ensureDir } from "@utils/ensure-dir";

import type { Config } from "@/types/config.types";
import type { ProcessedFieldAnalysisArray } from "@/types/field.types";
import type { Language, Languages } from "@/types/generated.types";

type CreateIndexesParams = {
	languages: Languages;
	config: Config;
	stats: ProcessedFieldAnalysisArray<keyof Language>;
};

type CreateIndexesType = (params: CreateIndexesParams) => Promise<void>;

const createIndexes: CreateIndexesType = async ({ languages, config, stats: _stats }) => {
	//

	const stats = new Map(_stats);

	const indexesDir = join(config.data.paths.outputDir, "indexes");
	await ensureDir(indexesDir);

	const fieldSet = createFieldSet({ source: languages, config, _phase: "transform" });

	const len = Object.keys(languages).length;

	const uniqueFields = [...fieldSet].filter((item) => stats.get(item)?.uniqueValues.size === len);

	const UNIQUE_FIELDS = new Set(uniqueFields);

	const indexEmitters = [...generateIndexEmitterOptions([...fieldSet], UNIQUE_FIELDS)];

	await Promise.all(
		indexEmitters.flatMap(async ({ name, emitter, options }) => {
			//

			const { norm, blocks } = emitter({ languages, config, stats: _stats, name, options });

			const content = blocks.build();

			const filePath = join(indexesDir, `${norm.fileName}.ts`);

			await writeFile(filePath, content);
		}),
	);
};

export { createIndexes };
export type { CreateIndexesParams, CreateIndexesType };
