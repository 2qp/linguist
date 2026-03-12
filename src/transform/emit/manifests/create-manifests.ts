import { join } from "node:path";
import { ensureDir } from "@utils/ensure-dir";
import { writeFile } from "@utils/write-file";
import { stringify } from "safe-stable-stringify";
import { buildMap } from "@/transform/utils/build-map";
import { createStatements } from "@/transform/utils/create-statements";

import type { Config } from "@/types/config.types";
import type { Languages } from "@/types/generated.types";
import type { ManifestEmitter } from "./types";

type CreateManifestsParams = { languages: Languages; config: Config };

type CreateManifestsType = (params: CreateManifestsParams) => Promise<void>;

const createManifests: CreateManifestsType = async ({ config, languages }) => {
	//

	const indexesDir = join(config.data.paths.manifestsDir, ".");
	await ensureDir(indexesDir);

	const indexEmitters: ManifestEmitter[] = [
		{ name: "extensions", config: { kind: "set", left: "extensions", right: "name" } },
		{ name: "filenames", config: { kind: "set", left: "filenames", right: "name" } },
		{ name: "interpreters", config: { kind: "set", left: "interpreters", right: "name" } },
		{
			name: "languages",
			config: {
				kind: "custom",
				left: "name",
				properties: ["language_id", "name"],
			},
		},
	] as const;

	await Promise.all(
		indexEmitters.map(async ({ name, config: eConf }) => {
			//

			const map = buildMap({ source: languages, ...eConf });

			const filePath = join(indexesDir, `${name}.ts`);
			// const exportPath = join(indexesDir, `${name}.ts`);

			const content = Object.fromEntries(map);

			const json = stringify(content, (_k, v) => (v instanceof Set ? [...v] : v), 2) || "";

			const { common, primary } = createStatements({ config, name, obj: json, falls: [], types: [] });

			const str = [primary.varTemplate, primary.typeSt, common.exportVar, common.exportVarType].join("\n\n");

			if (!json) return;

			await writeFile({ content: str, filePath });
			// await createJsonExport({ alias: name, filePath: exportPath, sourcePath: `./${name}.json`, json });
		}),
	);
};

export { createManifests };
export type { CreateManifestsParams, CreateManifestsType };
