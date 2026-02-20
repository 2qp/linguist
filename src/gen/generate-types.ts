import { generateDynamicTypes } from "./generate-dynamic-types";
import { join } from "node:path";
import { ensureDir } from "@utils/ensure-dir";
import { resolvePath } from "@utils/resolve-path";
import { writeFile } from "@utils/write-file";
import { createReExports } from "@/transform/utils/create-re-exports";

import type { Meta } from "@core/create-meta";
import type { Ref } from "@core/create-reference";
import type { Field } from "@/types/branded.types";
import type { Config } from "@/types/config.types";
import type { FieldAnalysisArray } from "@/types/field.types";
import type { Primitive } from "@/types/gen.types";
import type { LanguageData } from "@/types/lang.types";

type GenerateTypesParams<
	TSource extends Record<string, unknown> = LanguageData,
	TField extends string = Field,
	TUnique extends Primitive = Primitive,
> = {
	config: Config;
	source: TSource;
	ref: Ref;
	meta: Meta;
	stats: FieldAnalysisArray<TField, TUnique>;
};

type GenerateTypesType = (params: GenerateTypesParams) => Promise<void>;

const generateTypes: GenerateTypesType = async ({ config, source, meta, ref, stats }) => {
	//

	const outputDir = resolvePath(config.type.paths.outputDir);

	try {
		const typesOutput = generateDynamicTypes({ config: config, source, meta, ref, stats });

		await ensureDir(outputDir);
		const outputPath = join(outputDir, config.type.out.fileName);
		await writeFile({ content: typesOutput, filePath: outputPath });

		await createReExports({
			sourceDir: outputDir,
			outputFile: join(outputDir, "index.ts"),
		});

		// mmmaybe use `ora spinner`
		console.info(`Types generated to: ${outputPath}\n`);
	} catch (error) {
		console.error("Error generating types:", error);
	}
};

export { generateTypes };
export type { GenerateTypesParams, GenerateTypesType };
