import { createFallback } from "@/transform/utils/create-fallback";

import type { Extensions, LanguageName } from "@/generated/types/language-types.generated";
import type { MapEmitterType } from "./types";

const emitExtToLangMap: MapEmitterType = ({ languages, config }): string => {
	//

	const buildExtensionMap = () => {
		const extensionMap = new Map<Extensions[number], Set<LanguageName>>();

		for (const languageName of Object.keys(languages) as LanguageName[]) {
			if (!languageName) continue;

			const languageData = languages[languageName];

			const extensions = languageData?.extensions;

			if (!extensions) continue;

			for (const extension of extensions) {
				const exist = extensionMap.get(extension);
				if (!exist) {
					extensionMap.set(extension, new Set([languageName]));
					continue;
				}

				extensionMap.set(extension, new Set(exist).add(languageName));
			}
		}

		return extensionMap;
	};

	const extensionMap = buildExtensionMap();

	const entries = extensionMap
		.entries()
		.map(([ext, names]) => `  "${ext}": ${JSON.stringify([...names])},`)
		.toArray()
		.join("\n");

	const obj = "extension To Language" as const;

	const fb = createFallback({
		config,
		name: obj,
		obj: `{\n${entries}\n}`,
		falls: ["ReadonlyArray<LanguageName>", "undefined"],
		types: ["LanguageName"],
	});

	return [fb.typeImports[0], fb.raw, fb.varStatement, fb.typeStatement, ...fb.exportStatement].join("\n\n");
};

export { emitExtToLangMap };
