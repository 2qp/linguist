import type { Capitalized, NameId, Primitive, QuoteString } from "./gen.types";
import type { UnionToChunks, UnionToChunksResult, UnionToString } from "./utils/union-to-string.util.types";

type SegmentDef<
	T extends Primitive[][],
	TName extends string,
> = `const ${NameId<TName>} = [${`${QuoteString<T[number][number]>}, ${QuoteString<T[number][number]>}`}] as const;`;

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

export type { SegmentChunkedDef, SegmentDef };
