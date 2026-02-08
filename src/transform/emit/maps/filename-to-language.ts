import { stringify } from "safe-stable-stringify";

import type { Filenames, LanguageName } from "@/generated/types/language-types.generated";
import type { MapEmitterType } from "./types";

const emitFileNameToLanguage: MapEmitterType = ({ languages }): string => {
	//

	const buildExtensionMap = () => {
		const fileNameToLangMap = new Map<Filenames[number], Set<LanguageName>>();

		for (const languageName of Object.keys(languages) as LanguageName[]) {
			if (!languageName) continue;

			const languageData = languages[languageName];

			const filenames = languageData?.filenames;

			if (!filenames) continue;

			for (const filename of filenames) {
				const exist = fileNameToLangMap.get(filename);
				if (!exist) {
					fileNameToLangMap.set(filename, new Set([languageName]));
					continue;
				}

				fileNameToLangMap.set(filename, new Set(exist).add(languageName));
			}
		}

		return fileNameToLangMap;
	};

	const extensionMap = buildExtensionMap();

	const entries = extensionMap
		.entries()
		.map(([ext, names]) => `  "${ext}": ${stringify([...names])},`)
		.toArray()
		.join("\n");

	const obj = "fileNameToLanguage" as const;
	const typeName = "FileNameToLanguage" as const;

	return [
		`const ${obj} = {\n${entries}\n} as const;\n\n`,
		`type ${typeName} = typeof ${obj};\n\n`,
		`export { ${obj} };\n`,
		`export type { ${typeName} };\n`,
	].join("");
};

export { emitFileNameToLanguage };
