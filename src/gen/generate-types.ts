import { generateDynamicTypes } from "./generate-dynamic-types";
import { join } from "node:path";
import { getFile } from "@services/fetch/get-file";
import { ensureDir } from "@utils/ensure-dir";
import { resolvePath } from "@utils/resolve-path";
import { writeFile } from "@utils/write-file";
import { configLoader } from "@/infra/loaders/config-loader";
import { yamlLoader } from "@/infra/loaders/yaml-loader";
import { createReExports } from "@/transform/utils/create-re-exports";

import type { LanguageData } from "@/types/lang.types";

type GenerateTypesParams = {};

type GenerateTypesType = (params: GenerateTypesParams) => Promise<void>;

const generateTypes: GenerateTypesType = async () => {
	//

	const config = await configLoader();

	const fileStr = await getFile<string>(config.core.url, "text");

	const yamlPath = config.core.url;

	const outputDir = resolvePath(config.type.paths.outputDir);

	try {
		console.info(`Reading: ${yamlPath}...\n`);

		const data = yamlLoader<LanguageData>({ str: fileStr });

		const typesOutput = generateDynamicTypes({ config: config, data });

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
