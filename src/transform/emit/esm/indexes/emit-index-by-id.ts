import { createFallback } from "@/transform/utils/create-fallback";
import { normalizeName } from "@/transform/utils/normalize-name";
import { removeTrailingSlash } from "@/transform/utils/remove-trailing-slash";
import { createStatementPaths } from "@/transform/utils/statement/create-statement-paths";

import type { Languages } from "@/types/generated.types";
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

	const paths = createStatementPaths(config);

	const manualTypeImports = [`import type { Language, FallbackForUnknownKeys } from "${paths.common}";`];

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

	const obj = "by Id" as const;

	const fallback = createFallback({ config, name: obj, falls: ["Language", "undefined"], types: ["Language"] });

	// later with ts compiler api
	return [
		`${joinedImports}`,
		"\n\n",
		`${joinedTypeImports}`,
		"\n\n",
		`${joinedManualTypeImports}`,
		"\n\n",
		`const ${fallback.norm.varName} : ${fallback.norm.typeName} = {\n${joinedResult}\n} as const;`,
		"\n\n",
		`type ${fallback.norm.typeName} = {\n${joinedTypeEntries}\n} & ${fallback.fall};\n`,
		"\n\n",
		`export { ${fallback.norm.varName} };\n`,
		`export type { ${fallback.norm.typeName} };`,
		"\n",
	].join("");
};

export { emitIndexById };
