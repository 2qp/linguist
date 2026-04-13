import { emitMap } from "./emit-map";
import { join } from "node:path";
import { ensureDir } from "@utils/ensure-dir";
import { writeFile } from "@utils/write-file";

import type { Config } from "@/types/config.types";
import type { ProcessedFieldAnalysisArray } from "@/types/field.types";
import type { Language, Languages } from "@/types/generated.types";
import type { MapEmitter, MapEmitterOptions } from "./types";

type CreateMapsParams = {
	languages: Languages;
	config: Config;
	stats: ProcessedFieldAnalysisArray<keyof Language>;
};

type CreateMapsType = (params: CreateMapsParams) => Promise<void>;

const createMaps: CreateMapsType = async ({ config, languages, stats }) => {
	//

	const indexesDir = join(config.data.paths.mapsDir, ".");
	await ensureDir(indexesDir);

	const mapEmitters: MapEmitter<MapEmitterOptions>[] = [
		{ name: "extension-to-name", emitter: emitMap, options: { kind: "set", left: "extensions", right: "name" } },
		{ name: "filename-to-name", emitter: emitMap, options: { kind: "set", left: "filenames", right: "name" } },
		{ name: "interpreter-to-name", emitter: emitMap, options: { kind: "set", left: "interpreters", right: "name" } },
		{
			name: "language-id-to-name",
			options: { kind: "primitive", key: "language_id", value: "name" },
			emitter: emitMap,
		},
		{ name: "name-to-type", emitter: emitMap, options: { kind: "primitive", key: "name", value: "type" } },
		{ name: "extension-to-type", emitter: emitMap, options: { kind: "set", left: "extensions", right: "type" } },
	];

	await Promise.all(
		mapEmitters.map(async ({ name, emitter, options }) => {
			const { content, norm } = emitter({ languages, config, stats, name, options });

			const filePath = join(indexesDir, `${norm.fileName}.ts`);
			await writeFile({ filePath, content });
		}),
	);
};

export { createMaps };
export type { CreateMapsParams, CreateMapsType };
