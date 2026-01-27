import { normalizeName } from "@/transform/utils/normalize-name";
import { removeTrailingSlash } from "@/transform/utils/remove-trailing-slash";

import type { Languages } from "@/generated/types/language-types.generated";
import type { Config } from "@/types/config.types";
import type { Entries } from "@/types/utility.types";

type EmitCategoryFileParams = {
	languages: Languages | Partial<Languages> | Readonly<Languages>;
	config: Config;
	category: string;
};

type EmitCategoryFileType = (params: EmitCategoryFileParams) => string;

const emitCategoryFile: EmitCategoryFileType = ({ config, languages, category }) => {
	//

	if (!languages) return "";

	const result = Object.keys(languages).map((name) => {
		//

		const norm = normalizeName(name);

		const entry = `  "${name}": ${norm.varName},` as const;

		return entry;

		//
	});

	const types = Object.keys(languages).map((name) => {
		//

		const norm = normalizeName(name);

		const entry = `  "${name}": ${norm.typeName},` as const;

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

	const typeImports = (Object.entries(languages) as Entries<Languages>).map(([name]) => {
		const norm = normalizeName(name);
		const langData = languages[name];
		const type = langData?.type || "programming";
		return ` import type { ${norm.typeName} } from "${removeTrailingSlash(config.data.paths.typesDir)}/${type}/${norm.fileName}";` as const;
	});

	const manualTypeImports = [
		`import type { Language, FallbackForUnknownKeys } from "${config.type.aliases.outputDir}/${config.type.out.fileNameNoExt}"` as const,
	];

	const joinedResult = result.join("\n");
	const joinedImports = imports.join("\n");
	const joinedTypeImports = typeImports.join("\n");
	const joinedManualTypeImports = manualTypeImports.join("\n");
	const joinedTypeEntries = types.join("\n");

	const name = normalizeName(category);

	return [
		`${joinedImports}`,
		"\n\n",
		`${joinedTypeImports}`,
		"\n\n",
		`${joinedManualTypeImports}`,
		"\n\n",
		`const ${name.varName} : ${name.typeName} = {`,
		"\n",
		`${joinedResult}`,
		"\n",
		"} as const;",
		"\n\n",
		`type ${name.typeName} = {\n${joinedTypeEntries}\n} & FallbackForUnknownKeys<Language | undefined>;\n`,
		"\n\n",
		`export { ${name.varName} };\n`,
		`export type { ${name.typeName} };`,
		"\n",
	].join("");
};

export { emitCategoryFile };
export type { EmitCategoryFileParams, EmitCategoryFileType };
