import { normalizeName } from "./normalize-name";
import { join } from "@utils/join";

import type { Config } from "@/types/config.types";
import type { LanguagePropertyTypeName } from "@/types/generated.types";

type FallBackPatterns =
	| LanguagePropertyTypeName
	| `${LanguagePropertyTypeName}[]`
	| `ReadonlyArray<${LanguagePropertyTypeName}>`
	| `undefined`;

type CreateFallbackParams<
	TName extends string,
	TFalls extends FallBackPatterns[],
	TTypes extends LanguagePropertyTypeName[],
> = {
	name: TName;
	falls: TFalls;
	types: TTypes;
	config: Config;
	obj?: string;
};

// type CreateFallbackType = <const TName extends string, const TFalls extends LanguagePropertyTypeName>(
// 	params: CreateFallbackParams<TName, TFalls>,
// ) => void;

/**
 *
 * could use this for creating fallbacks for `objects` which are unable to defien type explicitly.
 *
 * this uses existing `_object` and recreate a bew `object` with appended typeof `object` and fallback
 */
const createFallback = <
	const TName extends string,
	const TFalls extends FallBackPatterns[],
	const TTypes extends LanguagePropertyTypeName[],
>({
	name,
	falls,
	types,
	config,
	obj,
}: CreateFallbackParams<TName, TFalls, TTypes>) => {
	//

	const norm = normalizeName(name);

	const typeImports = [
		`import type { ${join(types, ", " as const)}, FallbackForUnknownKeys } from "${config.type.aliases.outputDir}/${config.type.out.fileNameNoExt}";`,
		`\n\n`,
	] as const;

	const raw = `const _${norm.varName} = ${obj} as const;` as const;

	const varStatement =
		`const ${norm.varName}: typeof _${norm.varName} & FallbackForUnknownKeys<${join(falls, " | " as const)}> = _${norm.varName};` as const;

	const fall = `FallbackForUnknownKeys<${join(falls, " | " as const)}>` as const;

	const asyncFall = `FallbackForUnknownKeys<() => Promise<${join(falls, " | " as const)}>>` as const;

	const typeStatement = `type ${norm.typeName} = typeof ${norm.varName};` as const;

	const exportVar = `export { ${norm.varName} };` as const;

	const exportVarType = `export type { ${norm.typeName} };` as const;

	const exportStatement = [exportVar, exportVarType] as const;

	return { raw, typeImports, varStatement, fall, asyncFall, typeStatement, exportStatement, norm };
};

export { createFallback };
export type { CreateFallbackParams, FallBackPatterns };
