import { stringify } from "safe-stable-stringify";

import type { LanguageName, Type } from "@/generated/types/language-types.generated";
import type { MapEmitterType } from "./types";

const emitLanguageToCategory: MapEmitterType = ({ languages }): string => {
	//

	const buildExtensionMap = () => {
		const langToCatMap = new Map<LanguageName, Type>();

		for (const languageName of Object.keys(languages) as LanguageName[]) {
			if (!languageName) continue;

			const languageData = languages[languageName];

			const cat = languageData?.type;

			if (!cat) continue;

			langToCatMap.set(languageName, cat);
		}

		return langToCatMap;
	};

	const extensionMap = buildExtensionMap();

	const entries = extensionMap
		.entries()
		.map(([ext, names]) => `  "${ext}": ${stringify(names)},`)
		.toArray()
		.join("\n");

	const obj = "languageToCategory" as const;
	const typeName = "LanguageToCategory" as const;

	return [
		`const ${obj} = {\n${entries}\n} as const;\n\n`,
		`type ${typeName} = typeof ${obj};\n\n`,
		`export { ${obj} };\n`,
		`export type { ${typeName} };\n`,
	].join("");
};

export { emitLanguageToCategory };
