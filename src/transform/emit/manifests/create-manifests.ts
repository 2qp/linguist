import { emitManifest } from "./emit-manifest";
import { join } from "node:path";
import { ensureDir } from "@utils/ensure-dir";
import { writeFile } from "@utils/write-file";
import stringify from "safe-stable-stringify";
import { createStatements } from "@/transform/utils/create-statements";

import type { Languages } from "@/generated/types/language-types.generated";
import type { Config } from "@/types/config.types";
import type { ManifestEmitter } from "./types";

type CreateManifestsParams = { languages: Languages; config: Config };

type CreateManifestsType = (params: CreateManifestsParams) => Promise<void>;

const createManifests: CreateManifestsType = async ({ config, languages }) => {
	//

	const indexesDir = join(config.data.paths.manifestsDir, ".");
	await ensureDir(indexesDir);

	const indexEmitters: ManifestEmitter[] = [
		{ name: "extensions", config: { key: "name", set: "name", data: "extensions" } },
		{ name: "filenames", config: { key: "name", set: "name", data: "filenames" } },
		{ name: "interpreters", config: { key: "name", set: "name", data: "interpreters" } },
		{
			name: "languages",
			config: {
				key: "name",
				set: "name",
				data: "interpreters",
				isCustom: true,
				custom: { name: "name", id: "language_id" },
			},
		},
	] as const;

	await Promise.all(
		indexEmitters.map(async ({ name, config: eConf }) => {
			//

			const map = emitManifest({ languages, config: eConf });

			if (!map) return;

			const filePath = join(indexesDir, `${name}.ts`);
			// const exportPath = join(indexesDir, `${name}.ts`);

			const content = Object.fromEntries(map);

			const json = stringify(content, (_k, v) => (v instanceof Set ? [...v] : v), 2) || "";

			const statements = createStatements({ config, name, obj: json });

			const str = statements.join("\n\n");

			if (!json) return;

			await writeFile({ content: str, filePath });
			// await createJsonExport({ alias: name, filePath: exportPath, sourcePath: `./${name}.json`, json });
		}),
	);
};

export { createManifests };
export type { CreateManifestsParams, CreateManifestsType };
