import type { QuoteString } from "../gen.types";

type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

type LastOfUnion<T> =
	UnionToIntersection<T extends unknown ? (x: T) => void : never> extends (x: infer R) => void ? R : never;

type TakeN<
	U,
	N extends number,
	Chunk extends unknown[] = [],
	Counter extends unknown[] = [],
> = Counter["length"] extends N
	? [Chunk, U]
	: [U] extends [never]
		? [Chunk, never]
		: TakeN<Exclude<U, LastOfUnion<U>>, N, [LastOfUnion<U>, ...Chunk], [unknown, ...Counter]>;

type UnionToChunksResult = { truncated: false; chunks: unknown[] } | { truncated: true; chunks: unknown[] };

type UnionToChunks<
	U,
	Depth extends number,
	MaxDepth extends number,
	Chunks extends unknown[] = [],
	Counter extends unknown[] = [],
> = Counter["length"] extends MaxDepth
	? { truncated: true; chunks: Chunks }
	: [U] extends [never]
		? { truncated: false; chunks: Chunks }
		: TakeN<U, Depth> extends [infer Chunk, infer Remainder]
			? Chunk extends unknown[]
				? UnionToChunks<Remainder, Depth, MaxDepth, [Chunk, ...Chunks], [unknown, ...Counter]>
				: never
			: never;

type TupleToString<
	T extends unknown[],
	MaxItems extends number = 20,
	Acc extends string = "",
	Counter extends unknown[] = [],
> = Counter["length"] extends MaxItems
	? `${Acc}...`
	: T extends [infer First, ...infer Rest]
		? Rest["length"] extends 0
			? `${Acc}${QuoteString<First>}`
			: TupleToString<Rest, MaxItems, `${Acc}${QuoteString<First>}, `, [unknown, ...Counter]>
		: Acc;

type UnionToString<T, MaxItems extends number = 20> = T extends unknown[] ? TupleToString<T, MaxItems> : never;

export type { UnionToChunks, UnionToChunksResult, UnionToString };
