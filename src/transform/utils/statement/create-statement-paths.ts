import type { Config } from "@/types/config.types";
import type { TypeGenConfig } from "@/types/gen-config.types";

type StmtPathRecord = Record<keyof TypeGenConfig["out"], string>;

const createStatementPaths = (config: Config) => {
	//

	const { common, usage } = config.type.out;

	const map = {
		common: `${common.dir.alias}/${common.file.name}` as const,
		usage: `${usage.dir.alias}/${usage.file.name}` as const,
	} as const satisfies StmtPathRecord;

	return map;
};

export { createStatementPaths };
