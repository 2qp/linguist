import { createPartialConfig } from "./utils";

import type { Config } from "@/types/config.types";

const dummyStmtPaths = createPartialConfig({
	type: {
		aliases: {
			outputDir: "OUT_DIR",
		},
		out: {
			fileNameNoExt: "FILE_NO_EXT",
		},
	},
}) as Config;

export { dummyStmtPaths };
