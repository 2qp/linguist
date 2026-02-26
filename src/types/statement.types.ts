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
	| `undefined`;

type ImportableType = LanguagePropertyTypeName | `FallbackForUnknownKeys`;

type SL<T, U> = [strict: T, loose: U];

export type { ImportableType, SL, TypeRef, Wrapper };
