import { normalizeName } from "./normalize-name";
import { createStatementPaths } from "./statement/create-statement-paths";
import { join } from "@utils/join";
import { safeReplacer } from "@utils/safe-replacer";

import type { Config } from "@/types/config.types";
import type { LanguagePropertyTypeName } from "@/types/generated.types";

type FallBackPatterns =
	| LanguagePropertyTypeName
	| `${LanguagePropertyTypeName}[]`
	| `ReadonlyArray<${LanguagePropertyTypeName}>`
	| `undefined`
	| (string & {});

type Wrapper = "ReadonlyArray<$>" | "Partial<$>" | "$";

type TypeStatement = LanguagePropertyTypeName | `FallbackForUnknownKeys` | (string & {});

type CreateStatementsParams<
	TName extends string,
	TFalls extends FallBackPatterns[],
	TTypes extends TypeStatement[],
	TWrapper extends Wrapper,
> = {
	name: TName;
	obj: string;
	typeObj?: string;
	falls: TFalls;
	types: TTypes;
	config: Config;
	wrapper?: TWrapper;
};

// type CreateStatements = <const TName extends string>(params: CreateStatementsParams<TName>) => void;

/**
 * @deprecated
 *
 * use `create-statement-builder.ts`
 */
const createStatements = <
	const TName extends string,
	const TFalls extends FallBackPatterns[],
	const TTypes extends TypeStatement[],
	const TWrapper extends Wrapper,
>({
	name,
	obj,
	falls,
	types,
	config,
	typeObj = "",
	wrapper = "$" as TWrapper,
}: CreateStatementsParams<TName, TFalls, TTypes, TWrapper>) => {
	//

	const { varName, typeName, ...norm } = normalizeName(name);

	const paths = createStatementPaths(config);

	//
	const typeImportsAr = [`import type { ${join(types, ", " as const)} }`, ` from "${paths.common}";`] as const;

	const typeImports = join(typeImportsAr, "");

	const varTemplate = `const ${varName} = ${obj} as const;` as const;

	const varTypedTemplate = `const ${varName}: ${typeName} = ${obj} as const;` as const;

	const typeSt = `type ${typeName} = typeof ${varName};` as const;

	const exportVar = `export { ${varName} };` as const;

	const exportVarType = `export type { ${typeName} };` as const;

	//
	const prefixedVarTemplate = `const _${varName} = ${obj} as const;` as const;

	const fallsWrapped = safeReplacer(wrapper, "$" as const, join(falls, " | "));

	const varFallbackTypeArray = [
		`const ${varName}: typeof _${varName}`,
		` & `,
		`FallbackForUnknownKeys<${join(falls, " | " as const)}> = _${varName};`,
	] as const;

	const varFallbackTypeTemplate = join(varFallbackTypeArray, "");

	const typeFallbackArray = [
		`type ${typeName} = ${typeObj}`,
		` & `,
		`FallbackForUnknownKeys<${join(falls, " | " as const)}>;`,
	] as const;

	const typeFallbackTemplate = join(typeFallbackArray, "");

	const typeAsyncFallbackArray = [
		`type ${typeName} = ${typeObj}`,
		` & `,
		`FallbackForUnknownKeys<() => Promise<${join(falls, " | " as const)}>>;`,
	] as const;

	const typeAsyncFallbackTemplate = join(typeAsyncFallbackArray, "");

	const fallbackTemplate = `FallbackForUnknownKeys<${join(falls, " | " as const)}>` as const;

	const asyncFallbackTemplate = `FallbackForUnknownKeys<() => Promise<${join(falls, " | " as const)}>>` as const;

	const bundle = {
		common: { typeImports, exportVar, exportVarType, norm: { varName, typeName, ...norm } },
		primary: { varTemplate, varTypedTemplate, typeSt },
		secondary: {
			prefixedVarTemplate,
			varFallbackTypeTemplate,
			typeFallbackTemplate,
			typeAsyncFallbackTemplate,
			fallbackTemplate,
			asyncFallbackTemplate,
			fallsWrapped,
			falls,
		},
	} as const;

	return bundle;
};

export { createStatements };
export type { CreateStatementsParams };
