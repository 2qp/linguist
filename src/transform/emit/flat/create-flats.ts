import { emitESMFlat } from "./emit-esm-flat";
import { emitJSONFlat } from "./emit-json-flat";
import { emitNormalizedAllFlat } from "./emit-normalized-all-flat";
import { join } from "node:path";
import { ensureDir } from "@services/fs/ensure-dir";
import { writeFile } from "@services/fs/write-file";
import { createJsonExport } from "@/transform/utils/create-json-export";

import type { Config } from "@/types/config.types";
import type { Languages } from "@/types/generated.types";
import type { FlatEmitter } from "./types";

type CreateFlatsParams = { languages: Languages; config: Config };

type CreateFlatsType = (params: CreateFlatsParams) => Promise<void>;

const createFlats: CreateFlatsType = async ({ config, languages }) => {
	//

	const indexesDir = join(config.data.paths.flatDir, ".");
	await ensureDir(indexesDir);

	const indexEmitters: FlatEmitter[] = [
		{ name: "languages", emitter: emitESMFlat },
		{ name: "all", emitter: emitJSONFlat },
		{ name: "normalized-all", emitter: emitNormalizedAllFlat },
	];

	await Promise.all(
		indexEmitters.map(async ({ name, emitter, ext }) => {
			const fileName = `${name}.${ext ?? "ts"}`.trim();
			const filePath = join(indexesDir, fileName);
			const content = emitter({ languages, config });
			await writeFile({ filePath, content });

			// wont untill #32063
			if (ext === "json") {
				const exportPath = join(indexesDir, `${name}.ts`);
				await createJsonExport({ alias: name, filePath: exportPath, sourcePath: `./${name}.json` });
			}
		}),
	);
};

export { createFlats };
export type { CreateFlatsParams, CreateFlatsType };
