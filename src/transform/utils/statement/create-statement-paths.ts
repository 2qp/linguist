import type { Config } from "@/types/config.types";

const createStatementPaths = (config: Config) => {
	//

	const map = {
		commons: `${config.type.aliases.outputDir}/${config.type.out.fileNameNoExt}` as const,
	} as const;

	return map;
};

export { createStatementPaths };
