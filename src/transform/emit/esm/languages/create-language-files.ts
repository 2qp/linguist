import { emitLanguageFile } from "./emit-language-file";
import { join } from "node:path";
import { writeFile } from "@utils/write-file";
import { normalizeName } from "@/transform/utils/normalize-name";

import type { Languages } from "@/generated/types/language-types.generated";
import type { Config } from "@/types/config.types";

type CreateLanguageFilesParams = {
	languages: Partial<Languages>;
	type: string;
	config: Config;
};

type CreateLanguageFilesType = (params: CreateLanguageFilesParams) => Promise<void>;

const createLanguageFiles: CreateLanguageFilesType = async ({ type, languages, config }) => {
	//

	const typeDir = join(config.data.paths.esmDir, "languages", type);

	await Promise.all(
		Object.entries(languages).map(async ([origName, data]) => {
			const norm = normalizeName(origName);
			const filePath = join(typeDir, `${norm.fileName}.ts`);
			const content = emitLanguageFile({ norm, data });
			await writeFile({ filePath, content });
		}),
	);
};

export { createLanguageFiles };
export type { CreateLanguageFilesParams, CreateLanguageFilesType };
