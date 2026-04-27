import type { Primitive } from "./gen.types";
import type { LanguagePropertyTypeName } from "./generated.types";

type Dictionary = "Dictionary";

type OptionalBrand = "OptionalBrand";

type Wrapper =
	| "ReadonlyArray<$>"
	| "Partial<$>"
	| "ReadonlyArray<Partial<$>>"
	| `${Dictionary}<ReadonlyArray<$>>`
	| `${Dictionary}<$>`
	| `${Dictionary}<() => Promise<$>>`
	| `${OptionalBrand}<$>`
	| "() => Promise.all([ $ ])"
	| "() => Promise<[$]>"
	| "() => Promise<$>"
	| "() => $"
	| "$[number]"
	| "[$]"
	| "($)"
	| "$";

type Separator = " | " | ", ";

type TypeRef =
	| LanguagePropertyTypeName
	| `${LanguagePropertyTypeName}[]`
	| `ReadonlyArray<${LanguagePropertyTypeName}>`
	| `undefined`;

type ImportableType = LanguagePropertyTypeName | Dictionary | OptionalBrand;

type SL<T, U> = [strict: T, loose: U];

type From<T, U> = [paths: T, path: U];

// mmm var().prefix().asValue().type().wrap().types().custom()
type VarPrefixAsValueWrapTypesCustomParams<TName extends Primitive, TValue extends Primitive> = {
	name: TName;
	value: TValue;
};

export type {
	From,
	ImportableType,
	Separator,
	SL,
	TypeRef,
	VarPrefixAsValueWrapTypesCustomParams as CustomParams,
	Wrapper,
};
