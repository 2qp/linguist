type Entries<T> = {
	[K in keyof T]: [K, T[K]];
}[keyof T][];

type LooseToStrict<T> = T extends unknown ? (string extends T ? never : T) : never;

type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

type ExtractExplicit<T extends Record<string, unknown>> = {
	[K in keyof T as string extends K ? never : K]: T[K];
};

type ExtractIndexSignature<T extends Record<string, unknown>> = {
	[K in keyof T as string extends K ? K : never]: T[K];
};

type KeysOfUnion<T> = T extends T ? keyof T : never;

type ValueFromUnion<T, K extends PropertyKey> = T extends unknown ? (K extends keyof T ? T[K] : never) : never;

type ValueFromUnionByKey<T, K extends KeysOfUnion<T>> = T extends unknown ? (K extends keyof T ? T[K] : never) : never;

type NonNullableValueFromUnion<T, K extends PropertyKey> = NonNullable<ValueFromUnion<T, K>>;

type NonNullableValueFromUnionByKey<T, K extends KeysOfUnion<T>> = NonNullable<ValueFromUnionByKey<T, K>>;

type NonUndefined<T> = T extends undefined ? never : T;

type NonNullableElementOf<T> =
	NonNullable<T> extends ReadonlyArray<infer U> ? NonNullable<U> & {} : NonNullable<T> & {};

type ElementOf<T> = T extends ReadonlyArray<infer U> ? U : T;

type ExtractSetElement<T> = T extends Set<infer U> ? U : T;

type HomogeneousArray<T, K> = K extends keyof T[keyof T]
	? Exclude<T[keyof T][K], undefined> extends readonly unknown[]
		? Exclude<T[keyof T][K], undefined>[number][]
		: Exclude<T[keyof T][K], undefined>[]
	: never;

type DeepPartial<T> = T extends (...args: unknown[]) => unknown
	? T
	: T extends Array<infer U>
		? DeepPartialArray<U>
		: T extends object
			? DeepPartialObject<T>
			: T | undefined;

type DeepPartialArray<T> = Array<DeepPartial<T>>;

type DeepPartialObject<T> = {
	[K in keyof T]?: DeepPartial<T[K]>;
};

type ExplicitDictionary<T> = {
	[K in string & {}]: T;
};

/**
 * dictionary type that accepts any string key.
 *
 * useful as a fallback type for objects with unknown or dynamic keys.
 *
 * evolved from `FallbackForUnknownKeys`.
 *
 * @example
 * type Config = {
 *   knownSetting: string;
 * } & Dictionary<unknown>;
 */
type Dictionary<T> = Record<string & {}, T>;

type KeyOf<T> = Extract<keyof T, string>;

export type {
	DeepPartial,
	Dictionary,
	ElementOf,
	Entries,
	ExplicitDictionary,
	ExtractExplicit,
	ExtractIndexSignature,
	ExtractSetElement,
	HomogeneousArray,
	KeyOf,
	KeysOfUnion,
	LooseToStrict,
	NonNullableElementOf,
	NonNullableValueFromUnion,
	NonNullableValueFromUnionByKey,
	NonUndefined,
	Prettify,
	ValueFromUnion,
	ValueFromUnionByKey,
};
