import { join } from "node:path";
import { generateDynamicTypes } from "@gen/generate-dynamic-types";
import { ensureDir } from "@utils/ensure-dir";
import { resolvePath } from "@utils/resolve-path";
import { writeFile } from "@utils/write-file";
import { createReExports } from "@/transform/utils/create-re-exports";

import type { Creator } from "./types";

const createDynamicTypes: Creator = async (params) => {
	//

	const typesOutput = generateDynamicTypes(params);

	const outputDir = resolvePath(params.config.type.paths.outputDir);
	await ensureDir(outputDir);

	const outputPath = join(outputDir, params.config.type.out.fileName);
	await writeFile({ content: typesOutput, filePath: outputPath });

	await createReExports({
		sourceDir: outputDir,
		outputFile: join(outputDir, "index.ts"),
	});
};

export { createDynamicTypes };
