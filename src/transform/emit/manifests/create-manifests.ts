import { emitManifest } from "./emit-manifest";
import { join } from "node:path";
import { ensureDir } from "@utils/ensure-dir";
import { writeFile } from "@utils/write-file";

import type { Config } from "@/types/config.types";
import type { ProcessedFieldAnalysisArray } from "@/types/field.types";
import type { Language, Languages } from "@/types/generated.types";
import type { ManifestEmitter, ManifestEmitterOptions } from "./types";

type CreateManifestsParams = {
	languages: Languages;
	config: Config;
	stats: ProcessedFieldAnalysisArray<keyof Language>;
};

type CreateManifestsType = (params: CreateManifestsParams) => Promise<void>;

const createManifests: CreateManifestsType = async ({ config, languages, stats }) => {
	//

	const indexesDir = join(config.data.paths.manifestsDir, ".");
	await ensureDir(indexesDir);

	const indexEmitters: ManifestEmitter<ManifestEmitterOptions>[] = [
		{ name: "extensions", options: { kind: "set", left: "extensions", right: "name" }, emitter: emitManifest },
		{ name: "filenames", options: { kind: "set", left: "filenames", right: "name" }, emitter: emitManifest },
		{ name: "interpreters", options: { kind: "set", left: "interpreters", right: "name" }, emitter: emitManifest },
		{
			name: "languages",
			options: {
				kind: "custom",
				left: "name",
				properties: ["language_id", "name"],
			},
			emitter: emitManifest,
		},
	] as const;

	await Promise.all(
		indexEmitters.map(async ({ name, options, emitter }) => {
			//

			const { content, norm } = emitter({ languages, config, stats, name, options });

			const filePath = join(indexesDir, `${norm.fileName}.ts`);

			await writeFile({ content, filePath });
		}),
	);
};

export { createManifests };
export type { CreateManifestsParams, CreateManifestsType };
