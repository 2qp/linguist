import { join } from "node:path";
import { generateDynamicTypes } from "@gen/generate-dynamic-types";
import { ensureDir } from "@services/fs/ensure-dir";
import { writeFile } from "@services/fs/write-file";
import { resolvePath } from "@utils/resolve-path";
import { createOutFilesMeta } from "@/transform/utils/create-out-files-meta";
import { createReExports } from "@/transform/utils/create-re-exports";

import type { Creator } from "./types";

const createDynamicTypes: Creator = async (params) => {
	//

	const typesOutput = await generateDynamicTypes(params);

	const { common } = createOutFilesMeta(params.config);

	const outputDir = resolvePath(common.config.dir.rel);
	await ensureDir(outputDir);

	await writeFile({ content: typesOutput, filePath: common.path });

	await createReExports({
		sourceDir: outputDir,
		outputFile: join(outputDir, "index.ts"),
	});
};

export { createDynamicTypes };
