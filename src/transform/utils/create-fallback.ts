import { normalizeName } from "./normalize-name";
import { join } from "@utils/join";

import type { LanguagePropertyTypeName } from "@/generated/types";
import type { Config } from "@/types/config.types";

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
};

// type CreateFallbackType = <const TName extends string, const TFalls extends LanguagePropertyTypeName>(
// 	params: CreateFallbackParams<TName, TFalls>,
// ) => void;

/**
 *
 * could use this for creating fallbacks for `objects` which are unable to defien type explicitly.
 *
 * this uses existing `object` and recreate a bew `object` with appended typeof `object` and fallback
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
}: CreateFallbackParams<TName, TFalls, TTypes>) => {
	//

	const norm = normalizeName(name);

	const typeImports = [
		`import type { ${join(types, ", " as const)}, FallbackForUnknownKeys } from "${config.type.aliases.outputDir}/${config.type.out.fileNameNoExt}";`,
		`\n\n`,
	] as const;

	const varStatement =
		`const ${norm.varName}: typeof _${norm.varName} & FallbackForUnknownKeys<${join(falls, " | " as const)}> = _${norm.varName};` as const;

	const fall = `FallbackForUnknownKeys<${join(falls, " | " as const)}>` as const;

	const asyncFall = `FallbackForUnknownKeys<() => Promise<${join(falls, " | " as const)}>>` as const;

	const typeStatement = `type ${norm.typeName} = typeof ${norm.varName};` as const;

	const exportStatement = [`export { ${norm.varName} };\n`, `export type { ${norm.typeName} };\n`] as const;

	return { typeImports, varStatement, fall, asyncFall, typeStatement, exportStatement, norm };
};

export { createFallback };
export type { CreateFallbackParams, FallBackPatterns };
