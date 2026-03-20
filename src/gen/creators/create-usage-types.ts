import { join } from "node:path";
import { generateUsageTypes } from "@gen/usage/generate-usage-types";
import { ensureDir } from "@utils/ensure-dir";
import { resolvePath } from "@utils/resolve-path";
import { writeFile } from "@utils/write-file";
import { createOutFilesMeta } from "@/transform/utils/create-out-files-meta";
import { createReExports } from "@/transform/utils/create-re-exports";

import type { Creator } from "./types";

const createUsageTypes: Creator = async (params) => {
	//

	const usageTypesOutput = generateUsageTypes(params);

	const { usage } = createOutFilesMeta(params.config);

	const usageDir = resolvePath(usage.config.dir.rel);
	await ensureDir(usageDir);

	await writeFile({ content: usageTypesOutput, filePath: usage.path });

	await createReExports({
		sourceDir: usageDir,
		outputFile: join(usageDir, "index.ts"),
	});
};

export { createUsageTypes };
