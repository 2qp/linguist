import type { Capitalized, NameId, Primitive, QuoteString } from "./gen.types";
import type { JoinUnion } from "./union.types";
import type { UnionToChunks, UnionToChunksResult, UnionToString } from "./utils/union-to-string.util.types";

type ElementToPrimitive<T> = T extends string
	? string
	: T extends number
		? number
		: T extends bigint
			? bigint
			: T extends boolean
				? boolean
				: T extends undefined
					? undefined
					: T extends null
						? null
						: T extends unknown
							? `unknown`
							: never;

type SegmentDef<
	T extends Primitive[][],
	TName extends string,
> = `const ${NameId<TName>} = [${`${QuoteString<ElementToPrimitive<T[number][number]>>}${string}`}] as const;`;

type TypeLabel<V> = V extends string
	? string
	: V extends number
		? number
		: V extends boolean
			? boolean
			: V extends unknown[]
				? `string[]`
				: V extends null
					? null
					: V extends undefined
						? undefined
						: V extends unknown
							? `unknown`
							: never;

type Widen<T> = T extends string
	? string
	: T extends number
		? number
		: T extends boolean
			? boolean
			: T extends readonly unknown[]
				? unknown[]
				: T extends null | undefined
					? T
					: T extends object
						? { [K in keyof T]: Widen<T[K]> }
						: T;

type RequiredValue<V> = Exclude<V, undefined>;

type ObjectLiteralString<
	T extends Record<string, unknown>,
	TOptions extends { partial: boolean },
> = `{ ${JoinUnion<{ [K in keyof T & string]: `${K}${TOptions["partial"] extends true ? "?" : ""}:${TypeLabel<RequiredValue<T[K]>>}, ` }[keyof T & string]>} }`;

type SegmentDefRecord<
	T extends Record<string, unknown>[][],
	TName extends string,
	TOptions extends { partial: boolean } = { partial: false },
> = `const ${NameId<TName>} = [${ObjectLiteralString<Widen<T[number][number]>, TOptions>}] as const;`;

type RecordToLiteral<
	T extends Record<string, unknown>,
	TOptions extends { partial: boolean } = { partial: false },
> = ObjectLiteralString<Widen<T>, TOptions>;

type ChunksToDef<Chunks extends unknown[], TName extends string, Counter extends unknown[] = []> = Chunks extends [
	infer First,
	...infer Rest,
]
	? Rest extends unknown[]
		?
				| ChunksToDef<Rest, TName, [...Counter, unknown]>
				| (First extends unknown[]
						? `const ${Capitalized<TName>}_${[...Counter, unknown]["length"]} = [${UnionToString<First>}] as const;`
						: never)
		: never
	: never;

// too many unions n those r too large... :(
// mmm keep limits under 5, even on tsgo
type SegmentChunkedDef<
	T extends Primitive[][],
	TName extends string,
	ChunkSize extends number = 2,
	MaxDepth extends number = 2,
> = T extends (infer U)[][]
	? UnionToChunks<U, ChunkSize, MaxDepth> extends infer Result
		? Result extends UnionToChunksResult
			? Result["truncated"] extends true
				? ChunksToDef<Result["chunks"], TName>
				: ChunksToDef<Result["chunks"], TName>
			: never
		: never
	: `const ${Capitalized<TName>}_${number} = [${Primitive}, ${Primitive}] as const;`;

export type {
	ElementToPrimitive,
	ObjectLiteralString,
	RecordToLiteral,
	SegmentChunkedDef,
	SegmentDef,
	SegmentDefRecord,
	Widen,
};
