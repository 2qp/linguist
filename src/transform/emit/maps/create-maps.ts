import { emitExtToLangMap } from "./emit-ext-to-lang-map";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ensureDir } from "@utils/ensure-dir";

import type { Languages } from "@/generated/types/language-types.generated";
import type { Config } from "@/types/config.types";
import type { MapEmitter } from "./types";

type CreateMapsParams = {
	languages: Languages;
	config: Config;
};

type CreateMapsType = (params: CreateMapsParams) => Promise<void>;

const createMaps: CreateMapsType = async ({ config, languages }) => {
	//

	const indexesDir = join(config.data.paths.mapsDir, ".");
	await ensureDir(indexesDir);

	const indexEmitters: MapEmitter[] = [{ name: "ext-to-lang", emitter: emitExtToLangMap }];

	await Promise.all(
		indexEmitters.map(async ({ name, emitter }) => {
			const filePath = join(indexesDir, `${name}.ts`);
			const content = emitter({ languages, config });
			await writeFile(filePath, content);
		}),
	);
};

export { createMaps };
export type { CreateMapsParams, CreateMapsType };
