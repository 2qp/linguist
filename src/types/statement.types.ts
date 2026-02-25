import type { LanguagePropertyTypeName } from "./generated.types";

type Wrapper =
	| "ReadonlyArray<$>"
	| "Partial<$>"
	| "FallbackForUnknownKeys<$>"
	| "FallbackForUnknownKeys<() => Promise<$>>"
	| "$";

type TypeRef =
	| LanguagePropertyTypeName
	| `${LanguagePropertyTypeName}[]`
	| `ReadonlyArray<${LanguagePropertyTypeName}>`
	| `undefined`
	| (string & {});

type ImportableType = LanguagePropertyTypeName | `FallbackForUnknownKeys` | (string & {});

export type { ImportableType, TypeRef, Wrapper };
