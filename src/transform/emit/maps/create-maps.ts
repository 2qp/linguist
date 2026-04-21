import { generateMapOptions } from "./generate-map-options";
import { join } from "node:path";
import { createFieldSet } from "@gen/utils/create-field-set";
import { ensureDir } from "@utils/ensure-dir";
import { writeFile } from "@utils/write-file";

import type { Config } from "@/types/config.types";
import type { ProcessedFieldAnalysisArray } from "@/types/field.types";
import type { Language, Languages } from "@/types/generated.types";

type CreateMapsParams = {
	languages: Languages;
	config: Config;
	stats: ProcessedFieldAnalysisArray<keyof Language>;
};

type CreateMapsType = (params: CreateMapsParams) => Promise<void>;

const createMaps: CreateMapsType = async ({ config, languages, stats: _stats }) => {
	//

	const stats = new Map(_stats);

	const indexesDir = join(config.data.paths.mapsDir, ".");
	await ensureDir(indexesDir);

	const fieldSet = createFieldSet({ source: languages, config, _phase: "transform" });

	const len = Object.keys(languages).length;

	const uniqueFields = [...fieldSet].filter((item) => stats.get(item)?.uniqueValues.size === len);

	const UNIQUE_FIELDS = new Set(uniqueFields);

	const mapEmitters = [...generateMapOptions([...fieldSet], UNIQUE_FIELDS)];

	const seen = new Set();

	await Promise.all(
		mapEmitters.map(async ({ name, emitter, options }, index) => {
			//

			if (seen.has(name)) throw new Error(`Duplicate mapping name found: "${name}" at index ${index}`);
			seen.add(name);

			const { norm, blocks } = emitter({ languages, config, stats: _stats, name, options });

			const content = blocks.build();

			const filePath = join(indexesDir, `${norm.fileName}.ts`);
			await writeFile({ filePath, content });
		}),
	);
};

export { createMaps };
export type { CreateMapsParams, CreateMapsType };
