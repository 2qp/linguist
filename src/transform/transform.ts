import { ensureDir } from "../utils/ensure-dir";
import { groupByType } from "./core/group-by-type";
import { createArrays } from "./emit/arrays/create-arrays";
import { createCategories } from "./emit/esm/categories/create-categories";
import { createIndexes } from "./emit/esm/indexes/create-indexes";
import { createLanguageFiles } from "./emit/esm/languages/create-language-files";
import { createFlats } from "./emit/flat/create-flats";
import { createManifests } from "./emit/manifests/create-manifests";
import { createMaps } from "./emit/maps/create-maps";
import { createReExports } from "./utils/create-re-exports";
import { join } from "node:path";

import type { Field } from "@/types/branded.types";
import type { Config } from "@/types/config.types";
import type { ProcessedFieldAnalysisArray } from "@/types/field.types";
import type { Primitive } from "@/types/gen.types";
import type { Language, Languages } from "@/types/generated.types";
import type { LanguageData } from "@/types/lang.types";

type TransformParams<TField extends string = Field, TUnique extends Primitive = Primitive> = {
	config: Config;
	source: LanguageData | Languages;
	stats: ProcessedFieldAnalysisArray<TField, TUnique>;
};

type Transform = (params: TransformParams) => Promise<void>;

const transform: Transform = async ({ config, source, stats: _stats }) => {
	//

	const languages = source as unknown as Languages;
	const stats = _stats as unknown as ProcessedFieldAnalysisArray<keyof Language, Primitive>;

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

	await Promise.all([
		createCategories({ config, grouped }),

		createIndexes({ languages, config }),

		createMaps({ languages, config, stats }),

		createFlats({ languages, config }),

		createManifests({ languages, config, stats }),

		createArrays({ languages, config, stats }),

		createReExports({
			sourceDir: config.data.sourcePaths.gettersDir,
			outputFile: join(config.data.paths.gettersDir, "index.ts"),
		}),
	]);
};

export { transform };
export type { Transform, TransformParams };
