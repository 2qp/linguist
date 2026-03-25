import { createPartialConfig } from "./utils";

import type { Config } from "@/types/config.types";

const dummyStmtPaths = createPartialConfig({
	data: {
		paths: {
			typesDir: "TYPES_DIR",
		},
	},
	type: {
		out: {
			common: {
				dir: { alias: "OUT_DIR" },
				file: { name: "FILE_NO_EXT" },
			},

			usage: {
				dir: { alias: "OUT_DIR" },
				file: { name: "FILE_NO_EXT" },
			},
		},
	},
}) as Config;

export { dummyStmtPaths };
