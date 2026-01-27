import type { Extensions, LanguageName } from "@/generated/types/language-types.generated";
import type { MapEmitterType } from "./types";

const emitExtToLangMap: MapEmitterType = ({ languages }): string => {
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

	return [
		`const extensionToLanguage = {\n${entries}\n} as const;`,
		"\n\nexport { extensionToLanguage };",
		"\n\nexport type ExtensionToLanguage = typeof extensionToLanguage;\n",
	].join("");
};

export { emitExtToLangMap };
