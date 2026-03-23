import { stringify } from "safe-stable-stringify";
import { createFallback } from "@/transform/utils/create-fallback";

import type { Interpreters, LanguageName } from "@/types/generated.types";
import type { MapEmitterType } from "./types";

/**
 * @deprecated
 */
// @ts-expect-error
const emitInterpreterToLanguage: MapEmitterType = ({ languages, config }): string => {
	//

	const buildExtensionMap = () => {
		const interpreterToLangMap = new Map<Interpreters[number], Set<LanguageName>>();

		for (const languageName of Object.keys(languages) as LanguageName[]) {
			if (!languageName) continue;

			const languageData = languages[languageName];

			const interpreters = languageData?.interpreters;

			if (!interpreters) continue;

			for (const interpreter of interpreters) {
				const exist = interpreterToLangMap.get(interpreter);
				if (!exist) {
					interpreterToLangMap.set(interpreter, new Set([languageName]));
					continue;
				}

				interpreterToLangMap.set(interpreter, new Set(exist).add(languageName));
			}
		}

		return interpreterToLangMap;
	};

	const extensionMap = buildExtensionMap();

	const entries = extensionMap
		.entries()
		.map(([ext, names]) => `  "${ext}": ${stringify([...names])},`)
		.toArray()
		.join("\n");

	const obj = "interpreter To Language" as const;

	const fb = createFallback({
		config,
		name: obj,
		obj: `{\n${entries}\n}`,
		falls: ["ReadonlyArray<LanguageName>", "undefined"],
		types: ["LanguageName"],
	});

	return [fb.typeImports[0], fb.raw, fb.varStatement, fb.typeStatement, ...fb.exportStatement].join("\n\n");
};

export { emitInterpreterToLanguage };
