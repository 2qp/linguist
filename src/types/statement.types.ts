import type { Primitive } from "./gen.types";
import type { LanguagePropertyTypeName } from "./generated.types";

type Wrapper =
	| "ReadonlyArray<$>"
	| "Partial<$>"
	| "ReadonlyArray<Partial<$>>"
	| "FallbackForUnknownKeys<$>"
	| "FallbackForUnknownKeys<() => Promise<$>>"
	| "($)"
	| "$";

type TypeRef =
	| LanguagePropertyTypeName
	| `${LanguagePropertyTypeName}[]`
	| `ReadonlyArray<${LanguagePropertyTypeName}>`
	| `undefined`;

type ImportableType = LanguagePropertyTypeName | `FallbackForUnknownKeys`;

type SL<T, U> = [strict: T, loose: U];

type From<T, U> = [paths: T, path: U];

// mmm var().prefix().asValue().type().wrap().types().custom()
type VarPrefixAsValueWrapTypesCustomParams<TName extends Primitive, TValue extends Primitive> = {
	name: TName;
	value: TValue;
};

export type { VarPrefixAsValueWrapTypesCustomParams as CustomParams, From, ImportableType, SL, TypeRef, Wrapper };
