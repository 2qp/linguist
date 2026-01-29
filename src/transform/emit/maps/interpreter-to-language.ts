import { stringify } from "safe-stable-stringify";

import type { Interpreters, LanguageName } from "@/generated/types/language-types.generated";
import type { MapEmitterType } from "./types";

const emitInterpreterToLanguage: MapEmitterType = ({ languages }): string => {
	//

	const buildExtensionMap = () => {
		const interpreterToLangMap = new Map<Interpreters[number], LanguageName>();

		for (const languageName of Object.keys(languages) as LanguageName[]) {
			if (!languageName) continue;

			const languageData = languages[languageName];

			const interpreters = languageData?.interpreters;

			if (!interpreters) continue;

			for (const interpreter of interpreters) {
				const exist = interpreterToLangMap.get(interpreter);
				if (!exist) {
					interpreterToLangMap.set(interpreter, languageName);
					continue;
				}

				interpreterToLangMap.set(interpreter, languageName);
			}
		}

		return interpreterToLangMap;
	};

	const extensionMap = buildExtensionMap();

	const entries = extensionMap
		.entries()
		.map(([ext, names]) => `  "${ext}": ${stringify(names)},`)
		.toArray()
		.join("\n");

	const obj = "interpreterToLanguage" as const;
	const typeName = "InterpreterToLanguage" as const;

	return [
		`const ${obj} = {\n${entries}\n} as const;\n\n`,
		`type ${typeName} = typeof ${obj};\n\n`,
		`export { ${obj} };\n`,
		`export type { ${typeName} };\n`,
	].join("");
};

export { emitInterpreterToLanguage };
