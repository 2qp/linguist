import { stringify } from "safe-stable-stringify";
import { createFallback } from "@/transform/utils/create-fallback";

import type { LanguageName, Type } from "@/types/generated.types";
import type { MapEmitterType } from "./types";

const emitLanguageToCategory: MapEmitterType = ({ languages, config }): string => {
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

	const obj = "language To Category" as const;

	const fb = createFallback({
		config,
		name: obj,
		obj: `{\n${entries}\n}`,
		falls: ["Type", "undefined"],
		types: ["Type"],
	});

	return [fb.typeImports[0], fb.raw, fb.varStatement, fb.typeStatement, ...fb.exportStatement].join("\n\n");
};

export { emitLanguageToCategory };
