import { emitESMFlat } from "./emit-esm-flat";
import { emitJSONFlat } from "./emit-json-flat";
import { join } from "node:path";
import { ensureDir } from "@utils/ensure-dir";
import { writeFile } from "@utils/write-file";

import type { Languages } from "@/generated/types/language-types.generated";
import type { Config } from "@/types/config.types";
import type { FlatEmitter } from "./types";

type CreateFlatsParams = { languages: Languages; config: Config };

type CreateFlatsType = (params: CreateFlatsParams) => Promise<void>;

const createFlats: CreateFlatsType = async ({ config, languages }) => {
	//

	const indexesDir = join(config.data.paths.flatDir, ".");
	await ensureDir(indexesDir);

	const indexEmitters: FlatEmitter[] = [
		{ name: "all.esm", emitter: emitESMFlat },
		{ name: "all", emitter: emitJSONFlat, ext: "json" },
	];

	await Promise.all(
		indexEmitters.map(async ({ name, emitter, ext }) => {
			const fileName = `${name}.${ext ?? "ts"}`.trim();
			const filePath = join(indexesDir, fileName);
			const content = emitter({ languages, config });
			await writeFile({ filePath, content });
		}),
	);
};

export { createFlats };
export type { CreateFlatsParams, CreateFlatsType };
