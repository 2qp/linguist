import { ensureDir } from "../utils/ensure-dir";
import { groupByType } from "./core/group-by-type";
import { createCategories } from "./emit/esm/categories/create-categories";
import { createIndexes } from "./emit/esm/indexes/create-indexes";
import { createLanguageFiles } from "./emit/esm/languages/create-language-files";
import { createFlats } from "./emit/flat/create-flats";
import { createManifests } from "./emit/manifests/create-manifests";
import { createMaps } from "./emit/maps/create-maps";
import { createReExports } from "./utils/create-re-exports";
import { join } from "node:path";
import { getFile } from "@services/fetch/get-file";
import { buildEntries } from "@utils/build-entries";
import { configLoader } from "@/infra/loaders/config-loader";
import { yamlLoader } from "@/infra/loaders/yaml-loader";

import type { Languages } from "@/types/generated.types";

type TransformParams = {};

type TransformType = (params: TransformParams) => Promise<void>;

const transform: TransformType = async () => {
	//

	const config = await configLoader();

	const { outputDir } = config.data.paths;

	const yamlStr = await getFile<string>(config.core.url, "text");

	const rawLanguages = yamlLoader<Languages>({ str: yamlStr });

	if (!rawLanguages) throw Error("Unable to load yaml source data");

	const languages = buildEntries({ source: rawLanguages });

	await Promise.all([
		ensureDir(outputDir),
		ensureDir(join(outputDir, "indexes")),
		ensureDir(join(outputDir, "languages")),
	]);

	const grouped = groupByType({ languages });

	for (const [type, typeLanguages] of Object.entries(grouped)) {
		await createLanguageFiles({ languages: typeLanguages, type, config });
	}

	await createCategories({ config, grouped });

	await createIndexes({ languages, config });

	await createMaps({ languages, config });

	await createFlats({ languages, config });

	await createManifests({ languages, config });

	await createReExports({
		sourceDir: config.data.sourcePaths.gettersDir,
		outputFile: join(config.data.paths.gettersDir, "index.ts"),
	});
};

export { transform };
export type { TransformParams, TransformType };
