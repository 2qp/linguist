import { stringify } from "safe-stable-stringify";
import { createFallback } from "@/transform/utils/create-fallback";

import type { LanguageId, LanguageName } from "@/types/generated.types";
import type { MapEmitterType } from "./types";

const emitLanguageIdToName: MapEmitterType = ({ languages, config }): string => {
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

	const obj = "language Id To Name" as const;

	const fb = createFallback({
		config,
		name: obj,
		obj: `{\n${entries}\n}`,
		falls: ["LanguageName", "undefined"],
		types: ["LanguageName"],
	});

	return [fb.typeImports[0], fb.raw, fb.varStatement, fb.typeStatement, ...fb.exportStatement].join("\n\n");
};

export { emitLanguageIdToName };
