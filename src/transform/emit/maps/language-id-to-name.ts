import { stringify } from "safe-stable-stringify";

import type { LanguageId, LanguageName } from "@/generated/types/language-types.generated";
import type { MapEmitterType } from "./types";

const emitLanguageIdToName: MapEmitterType = ({ languages }): string => {
	//

	const buildExtensionMap = () => {
		const langIdToNameMap = new Map<LanguageId, LanguageName>();

		for (const languageName of Object.keys(languages) as LanguageName[]) {
			if (!languageName) continue;

			const languageData = languages[languageName];

			const id = languageData?.language_id;

			if (!id) continue;

			langIdToNameMap.set(id, languageName);
		}

		return langIdToNameMap;
	};

	const extensionMap = buildExtensionMap();

	const entries = extensionMap
		.entries()
		.map(([ext, names]) => `  "${ext}": ${stringify(names)},`)
		.toArray()
		.join("\n");

	const obj = "languageIdToName" as const;
	const typeName = "LanguageIdToName" as const;

	return [
		`const ${obj} = {\n${entries}\n} as const;\n\n`,
		`type ${typeName} = typeof ${obj};\n\n`,
		`export { ${obj} };\n`,
		`export type { ${typeName} };\n`,
	].join("");
};

export { emitLanguageIdToName };
