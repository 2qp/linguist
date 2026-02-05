import { normalizeName } from "@/transform/utils/normalize-name";
import { removeTrailingSlash } from "@/transform/utils/remove-trailing-slash";

import type { Languages } from "@/generated/types/language-types.generated";
import type { Entries } from "@/types/utility.types";
import type { IndexEmitterType } from "./types";

const emitLazyIndexById: IndexEmitterType = ({ languages, config }): string => {
	//

	const entries = (Object.entries(languages) as Entries<Languages>)
		.filter((lang) => lang[1].language_id !== undefined)
		.map(([name, data]) => {
			const norm = normalizeName(name);
			const langData = languages[name];
			const type = langData?.type || "programming";

			return `  ${data.language_id}: () => import('${removeTrailingSlash(config.data.paths.typesDir)}/${type}/${norm.fileName}').then(({ ${norm.varName} }) => ${norm.varName}),` as const;
		});

	const typeImports = (Object.entries(languages) as Entries<Languages>).map(([name]) => {
		const norm = normalizeName(name);
		const langData = languages[name];
		const type = langData?.type || "programming";
		return ` import type { ${norm.typeName} } from "${removeTrailingSlash(config.data.paths.typesDir)}/${type}/${norm.fileName}";`;
	});

	const types = (Object.entries(languages) as Entries<Languages>).map(([name, language]) => {
		//

		const norm = normalizeName(name);

		const entry = `  "${language.language_id}": () => Promise<${norm.typeName}>,` as const;

		return entry;

		//
	});

	const manualTypeImports = [
		`import type { Language, FallbackForUnknownKeys } from "${config.type.aliases.outputDir}/${config.type.out.fileNameNoExt}"` as const,
	];

	const joinedTypeImports = typeImports.join("\n");
	const joinedManualTypeImports = manualTypeImports.join("\n");
	const joinedTypeEntries = types.join("\n");

	// later with ts compiler api
	return [
		`${joinedTypeImports}`,
		"\n\n",
		`${joinedManualTypeImports}`,
		"\n\n",
		"const lazyById : LazyById = {",
		"\n",
		`${entries.join("\n")}`,
		"\n",
		"} as const;",
		"\n\n",

		`type LazyById = {\n${joinedTypeEntries}\n} & FallbackForUnknownKeys<() => Promise<Language | undefined>>;`,
		"\n\n",
		"export { lazyById };",
		"\n",
		"export type { LazyById };",
		"\n",
	].join("");
};

export { emitLazyIndexById };
