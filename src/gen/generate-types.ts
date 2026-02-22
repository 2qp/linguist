import { createDynamicTypes } from "./creators/create-dynamic-types";
import { join } from "node:path";

import type { Generator } from "./types";

type GenerateTypes = Generator;

const generateTypes: GenerateTypes = async (params) => {
	//

	try {
		const outputPath = join(params.config.type.paths.outputDir, params.config.type.out.fileName);

		await Promise.all([createDynamicTypes(params)]);

		// mmmaybe use `ora spinner`
		console.info(`Types generated to: ${outputPath}\n`);
	} catch (error) {
		console.error("Error generating types:", error);
	}
};

export { generateTypes };
export type { GenerateTypes };
