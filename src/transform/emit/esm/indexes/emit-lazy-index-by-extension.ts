import { join } from "@utils/join";
import { createStatements } from "@/transform/utils/create-statements";
import { normalizeName } from "@/transform/utils/normalize-name";
import { removeTrailingSlash } from "@/transform/utils/remove-trailing-slash";

import type { Extensions, LanguageName } from "@/generated/types/language-types.generated";
import type { IndexEmitterType } from "./types";

const emitLazyIndexByExtension: IndexEmitterType = ({ languages, config }): string => {
	//

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

	const allUniqueNames = [...new Set([...extensionMap.values()].flatMap((set) => [...set]))];

	const entries = [...extensionMap.entries()]
		.map(([ext, nameSet]) => {
			const importStatements = [...nameSet]
				.map((name) => {
					const norm = normalizeName(name);
					const langData = languages[name];
					const type = langData?.type || "programming";
					return `    import('${removeTrailingSlash(config.data.paths.typesDir)}/${type}/${norm.fileName}').then(({ ${norm.varName} }) => ${norm.varName})` as const;
				})
				.join(",\n");

			return `  "${ext}": () => Promise.all([\n${importStatements}\n  ]),` as const;
		})
		.join("\n");

	const types = [...extensionMap.entries()].map(([ext, nameSet]) => {
		const importStatements = [...nameSet]
			.map((name) => {
				const norm = normalizeName(name);
				return `${norm.typeName}` as const;
			})
			.join(", ");

		return `  "${ext}": () => Promise<[${importStatements}]>,`;
	});

	const typeImports = allUniqueNames.map((name) => {
		const norm = normalizeName(name);
		const langData = languages[name];
		const type = langData?.type || "programming";
		return ` import type { ${norm.typeName} } from "${removeTrailingSlash(config.data.paths.typesDir)}/${type}/${norm.fileName}";` as const;
	});

	const typeEntries = types.join("\n");
	const typeImportsEntries = typeImports.join("\n");

	const obj = "lazy By Extension" as const;

	const { common, primary, secondary } = createStatements({
		name: obj,
		obj: `{\n${entries}\n}`,
		typeObj: `{\n${typeEntries}\n}`,
		types: ["Language", "FallbackForUnknownKeys"],
		falls: ["Language[]", "undefined"],
		config,
	});

	const out = [
		typeImportsEntries,
		common.typeImports,
		primary.varTypedTemplate,
		secondary.typeAsyncFallbackTemplate,
		common.exportVar,
		common.exportVarType,
	] as const;

	const stringifiedOut = join(out, "\n\n");

	return stringifiedOut;
};

export { emitLazyIndexByExtension };
