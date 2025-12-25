import { normalizeName } from "@/transform/utils/normalize-name";
import { removeTrailingSlash } from "@/transform/utils/remove-trailing-slash";

import type { Extensions, LanguageName } from "@/generated/types/language-types.generated";
import type { IndexEmitterType } from "./types";

const emitIndexByExtension: IndexEmitterType = ({ languages, config }): string => {
	//

	//
	const buildExtensionMap = () => {
		// mmm instead of reducer + spread | 0.842ms, 0.535ms

		const extensionMap = new Map<Extensions[number], Set<LanguageName>>();

		for (const languageName of Object.keys(languages) as LanguageName[]) {
			if (!languageName) continue;

			const languageData = languages[languageName];

			const extensions = languageData?.extensions;

			if (!extensions) continue;

			for (const extension of extensions) {
				// extensionMap.get(extension)?.add(languageName) || extensionMap.set(extension, new Set([languageName]));

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

	const allUniqueNames = [...new Set([...extensionMap.values()].flatMap((set) => [...set]))];

	const result = [...extensionMap.entries()].flatMap(([ext, nameSet]) => {
		//

		const vars = [...nameSet]
			.map((name) => {
				const norm = normalizeName(name);
				return `${norm.varName}`;
			})
			.join(",");

		return `  "${ext}": [${[vars]}],` as const;

		//
	});

	const types = [...extensionMap.entries()].flatMap(([ext, nameSet]) => {
		//

		const vars = [...nameSet]
			.map((name) => {
				const norm = normalizeName(name);
				return `${norm.typeName}`;
			})
			.join(",");

		return `  "${ext}": [${[vars]}],` as const;

		//
	});

	const entries = result.join("\n");
	const typeEntries = types.join("\n");

	const imports = allUniqueNames
		.map((name) => {
			const norm = normalizeName(name);
			const langData = languages[name];
			const type = langData?.type || "programming";
			return ` import { ${norm.varName} } from "${removeTrailingSlash(config.data.paths.typesDir)}/${type}/${norm.fileName}";`;
		})
		.join("\n");

	const manualTypeImports = [
		`import type { Language, FallbackForUnknownKeys } from "${config.type.aliases.outputDir}/${config.type.out.fileNameNoExt}"`,
	].join("\n");

	const typeImports = allUniqueNames
		.map((name) => {
			const norm = normalizeName(name);
			const langData = languages[name];
			const type = langData?.type || "programming";
			return ` import type { ${norm.typeName} } from "${removeTrailingSlash(config.data.paths.typesDir)}/${type}/${norm.fileName}";`;
		})
		.join("\n");

	return [
		`${imports}`,
		"\n\n",
		`${typeImports}`,
		"\n\n",
		`${manualTypeImports}`,
		"\n\n",
		`const byExtension : ByExtension = {\n${entries}\n} as const;\n\nexport { byExtension };`,
		"\n\n",
		`export type ByExtension = {\n${typeEntries}\n} & FallbackForUnknownKeys<Language[]>;\n`,
	].join("");
};

export { emitIndexByExtension };
