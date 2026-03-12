import { join } from "node:path";
import { resolvePath } from "@utils/resolve-path";

import type { Config } from "@/types/config.types";
import type { InteralOutDef, TypeGenConfig } from "@/types/gen-config.types";

type OutFileMeta = {
	path: string;
	config: InteralOutDef;
};

type OutFilesRecord = Record<keyof TypeGenConfig["out"], OutFileMeta>;

const createOutFilesMeta = (config: Config): OutFilesRecord => {
	//

	const { common } = config.type.out;

	const map = {
		common: { path: join(resolvePath(common.dir.rel), `${common.file.name}${common.file.ext}`), config: common },
	} as const satisfies OutFilesRecord;

	return map;
};

export { createOutFilesMeta };
export type { OutFileMeta };
