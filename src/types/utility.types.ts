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

type NonUndefined<T> = T extends undefined ? never : T;

type ExtractArrayElement<T> = T extends readonly (infer U)[] ? U : T;

type ExtractSetElement<T> = T extends Set<infer U> ? U : T;

export type { Entries, ExtractArrayElement, ExtractExplicit, ExtractSetElement, LooseToStrict, NonUndefined, Prettify };
