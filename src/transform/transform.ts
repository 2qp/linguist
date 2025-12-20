import { ensureDir } from "../utils/ensure-dir";
import { groupByType } from "./core/group-by-type";
import { createLanguageFiles } from "./emit/esm/languages/create-language-files";
import { join } from "node:path";
import { getFile } from "@services/fetch/get-file";
import { configLoader } from "@/infra/loaders/config-loader";
import { yamlLoader } from "@/infra/loaders/yaml-loader";

import type { Languages } from "@/generated/types/language-types.generated";

type TransformParams = {};

type TransformType = (params: TransformParams) => Promise<void>;

const transform: TransformType = async () => {
	//

	const config = await configLoader();

	const { esmDir } = config.data.paths;

	const yamlStr = await getFile<string>(config.core.url, "text");

	const languages = yamlLoader<Languages>({ str: yamlStr });

	if (!languages) throw Error("Unable to load yaml source data");

	await Promise.all([ensureDir(esmDir), ensureDir(join(esmDir, "languages"))]);

	const grouped = groupByType({ languages });

	for (const [type, typeLanguages] of Object.entries(grouped)) {
		await createLanguageFiles({ languages: typeLanguages, type, config });
	}
};

await transform({});

export { transform };
export type { TransformParams, TransformType };
