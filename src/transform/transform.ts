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

import type { Config } from "@/types/config.types";
import type { Languages } from "@/types/generated.types";
import type { LanguageData } from "@/types/lang.types";

type TransformParams = {
	config: Config;
	source: LanguageData | Languages;
};

type TransformType = (params: TransformParams) => Promise<void>;

const transform: TransformType = async ({ config, source }) => {
	//

	const languages = source as unknown as Languages;

	const { outputDir } = config.data.paths;

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
