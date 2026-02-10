import { normalizeName } from "./normalize-name";
import { join } from "@utils/join";

import type { LanguagePropertyTypeName } from "@/generated/types";
import type { Config } from "@/types/config.types";

type FallBackPatterns =
	| LanguagePropertyTypeName
	| `${LanguagePropertyTypeName}[]`
	| `ReadonlyArray<${LanguagePropertyTypeName}>`
	| `undefined`;

type TypeStatement = LanguagePropertyTypeName | `FallbackForUnknownKeys`;

type CreateStatementsParams<TName extends string, TFalls extends FallBackPatterns[], TTypes extends TypeStatement[]> = {
	name: TName;
	obj: string;
	typeObj?: string;
	falls: TFalls;
	types: TTypes;
	config: Config;
};

// type CreateStatements = <const TName extends string>(params: CreateStatementsParams<TName>) => void;

const createStatements = <
	const TName extends string,
	const TFalls extends FallBackPatterns[],
	const TTypes extends TypeStatement[],
>({
	name,
	obj,
	falls,
	types,
	config,
	typeObj = "",
}: CreateStatementsParams<TName, TFalls, TTypes>) => {
	//

	const { varName, typeName, ...norm } = normalizeName(name);

	//
	const typeImportsAr = [
		`import type { ${join(types, ", " as const)} }`,
		` from "${config.type.aliases.outputDir}/${config.type.out.fileNameNoExt}";`,
	] as const;

	const typeImports = join(typeImportsAr, "");

	const varTemplate = `const ${varName} = ${obj} as const;` as const;

	const varTypedTemplate = `const ${varName}: ${typeName} = ${obj} as const;` as const;

	const typeSt = `type ${typeName} = typeof ${varName};` as const;

	const exportVar = `export { ${varName} };` as const;

	const exportVarType = `export type { ${typeName} };` as const;

	//
	const prefixedVarTemplate = `const _${varName} = ${obj} as const;` as const;

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
		},
	} as const;

	return bundle;
};

export { createStatements };
export type { CreateStatementsParams };
