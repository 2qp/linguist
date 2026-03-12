import type { Config } from "@/types/config.types";
import type { TypeGenConfig } from "@/types/gen-config.types";

type StmtPathRecord = Record<keyof TypeGenConfig["out"], string>;

const createStatementPaths = (config: Config) => {
	//

	const { dir, file } = config.type.out.common;

	const map = { common: `${dir.alias}/${file.name}` as const } as const satisfies StmtPathRecord;

	return map;
};

export { createStatementPaths };
