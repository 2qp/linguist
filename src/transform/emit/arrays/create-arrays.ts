import { emitArray } from "./emit-array";
import { emitFieldArray } from "./emit-field-array";
import { join } from "node:path";
import { createFieldSet } from "@gen/utils/create-field-set";
import { ensureDir } from "@services/fs/ensure-dir";
import { writeFile } from "@services/fs/write-file";

import type { Config } from "@/types/config.types";
import type { ProcessedFieldAnalysisArray } from "@/types/field.types";
import type { Language, Languages } from "@/types/generated.types";
import type { KeyOf } from "@/types/utility.types";
import type { ArrayEmitter, ArrayEmitterOptions, ArrayFieldEmitterOptions } from "./types";

type CreateArraysParams = {
	languages: Languages;
	config: Config;
	stats: ProcessedFieldAnalysisArray<KeyOf<Language>>;
};

type CreateArrays = (params: CreateArraysParams) => Promise<void>;

const createArrays: CreateArrays = async ({ config, languages, stats }) => {
	//

	const arraysDir = join(config.data.paths.arraysDir);
	await ensureDir(arraysDir);

	const fields = createFieldSet({ config, source: languages, _phase: "transform" });

	const arrayFieldEmitters: ArrayEmitter<ArrayFieldEmitterOptions>[] = [...fields].map((field) => {
		//

		const stat = new Map(stats).get(field);
		if (!stat) throw new Error(`unable to get stat for "${field}"`);

		return {
			name: `${field} array`,
			options: { field, stats: stat },
			emitter: emitFieldArray,
		};
	});

	const arrayEmitters: ArrayEmitter<ArrayEmitterOptions>[] = [
		{
			name: "id name",
			options: { kind: "custom", left: "language_id", properties: ["name", "language_id"] },
			emitter: emitArray,
		},

		{
			name: "all",
			options: {
				kind: "custom",
				left: "language_id",
				properties: [
					"ace_mode",
					"aliases",
					"codemirror_mime_type",
					"codemirror_mode",
					"color",
					"extensions",
					"filenames",
					"fs_name",
					"group",
					"interpreters",
					"language_id",
					"name",
					"searchable",
					"tm_scope",
					"type",
					"wrap",
				],
			},
			emitter: emitArray,
		},
	];

	await Promise.all([
		...arrayEmitters.map(async ({ emitter, ...params }) => {
			//

			const { content, norm } = emitter({ languages, config, stats, ...params });

			const filePath = join(arraysDir, `${norm.fileName}.ts`);
			await writeFile({ filePath, content });
		}),

		...arrayFieldEmitters.map(async ({ emitter, ...params }) => {
			//

			const { content, norm } = emitter({ languages, config, stats, ...params });

			const filePath = join(arraysDir, `${norm.fileName}.ts`);
			await writeFile({ filePath, content });
		}),
	]);
};

export { createArrays };
export type { CreateArrays, CreateArraysParams };
