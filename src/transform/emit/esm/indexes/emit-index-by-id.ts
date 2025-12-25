import { normalizeName } from "@/transform/utils/normalize-name";
import { removeTrailingSlash } from "@/transform/utils/remove-trailing-slash";

import type { Languages } from "@/generated/types/language-types.generated";
import type { Entries } from "@/types/utility.types";
import type { IndexEmitterType } from "./types";

const emitIndexById: IndexEmitterType = ({ languages, config }): string => {
	//

	const result = (Object.entries(languages) as Entries<Languages>).map(([name, language]) => {
		//

		const norm = normalizeName(name);

		const entry = `  "${language.language_id}": ${norm.varName},` as const;

		return entry;

		//
	});

	const types = (Object.entries(languages) as Entries<Languages>).map(([name, language]) => {
		//

		const norm = normalizeName(name);

		const entry = `  "${language.language_id}": ${norm.typeName},` as const;

		return entry;

		//
	});

	const imports = (Object.entries(languages) as Entries<Languages>)
		.filter((lang) => lang[1].language_id !== undefined)
		.map(([name]) => {
			const norm = normalizeName(name);
			const langData = languages[name];
			const type = langData?.type || "programming";

			return ` import { ${norm.varName} } from "${removeTrailingSlash(config.data.paths.typesDir)}/${type}/${norm.fileName}";` as const;
		});

	const manualTypeImports = [
		`import type { Language, FallbackForUnknownKeys } from "${config.type.aliases.outputDir}/${config.type.out.fileNameNoExt}"`,
	];

	const typeImports = (Object.entries(languages) as Entries<Languages>).map(([name]) => {
		const norm = normalizeName(name);
		const langData = languages[name];
		const type = langData?.type || "programming";
		return ` import type { ${norm.typeName} } from "${removeTrailingSlash(config.data.paths.typesDir)}/${type}/${norm.fileName}";`;
	});

	const joinedResult = result.join("\n");
	const joinedImports = imports.join("\n");
	const joinedTypeImports = typeImports.join("\n");
	const joinedManualTypeImports = manualTypeImports.join("\n");
	const joinedTypeEntries = types.join("\n");

	// later with ts compiler api
	return [
		`${joinedImports}`,
		"\n\n",
		`${joinedTypeImports}`,
		"\n\n",
		`${joinedManualTypeImports}`,
		"\n\n",
		"const byId : ById = {",
		"\n",
		`${joinedResult}`,
		"\n",
		"} as const;",
		"\n\n",
		`type ById = {\n${joinedTypeEntries}\n} & FallbackForUnknownKeys<Language | undefined>;\n`,
		"\n\n",
		"export { byId };\n",
		"export type { ById };",
		"\n",
	].join("");
};

export { emitIndexById };
