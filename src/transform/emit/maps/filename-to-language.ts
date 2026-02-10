import { stringify } from "safe-stable-stringify";
import { createFallback } from "@/transform/utils/create-fallback";

import type { Filenames, LanguageName } from "@/generated/types/language-types.generated";
import type { MapEmitterType } from "./types";

const emitFileNameToLanguage: MapEmitterType = ({ languages, config }): string => {
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

	const obj = "fileName To Language" as const;

	const fb = createFallback({
		config,
		name: obj,
		obj: `{\n${entries}\n}`,
		falls: ["ReadonlyArray<LanguageName>", "undefined"],
		types: ["LanguageName"],
	});

	return [fb.typeImports[0], fb.raw, fb.varStatement, fb.typeStatement, ...fb.exportStatement].join("\n\n");
};

export { emitFileNameToLanguage };
