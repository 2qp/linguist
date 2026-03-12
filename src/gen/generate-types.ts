import { createDynamicTypes } from "./creators/create-dynamic-types";
import { createOutFilesMeta } from "@/transform/utils/create-out-files-meta";

import type { Generator } from "./types";

type GenerateTypes = Generator;

const generateTypes: GenerateTypes = async (params) => {
	//

	try {
		const { common } = createOutFilesMeta(params.config);

		await Promise.all([createDynamicTypes(params)]);

		// mmmaybe use `ora spinner`
		console.info(`Types generated to: ${common.config.dir.rel}\n`);
	} catch (error) {
		console.error("Error generating types:", error);
	}
};

export { generateTypes };
export type { GenerateTypes };
