import { createPartialConfig } from "./utils";

import type { Config } from "@/types/config.types";

const dummyStmtPaths = createPartialConfig({
	type: {
		out: {
			common: {
				dir: { alias: "OUT_DIR" },
				file: { name: "FILE_NO_EXT" },
			},
		},
	},
}) as Config;

export { dummyStmtPaths };
