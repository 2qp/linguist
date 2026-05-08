type JoinSimple = <const T extends readonly string[], const TSep extends string>(arr: T, sep: TSep) => Join<T, TSep>;

const joinSimple: JoinSimple = (arr, sep) => arr.join(sep) as Join<typeof arr, typeof sep>;

// type Join<T extends readonly string[], TSep extends string> = T extends readonly []
// 	? ""
// 	: T extends readonly [infer First extends string, ...infer Rest extends readonly string[]]
// 		? Rest extends readonly []
// 			? First
// 			: Rest extends readonly [infer _Second extends string, ...infer _More]
// 				? Rest extends readonly [string, ...infer _Last]
// 					? `${First}${TSep}${Join<Rest, TSep>}`
// 					: string
// 				: `${First}${TSep}${string}`
// 		: string;

type Join<T extends readonly string[], TSep extends string> = T extends readonly []
	? ""
	: T extends readonly [infer First extends string, ...infer Rest extends readonly string[]]
		? Rest extends readonly []
			? First
			: Rest extends readonly [string, ...unknown[]]
				? `${First}${TSep}${Join<Rest, TSep>}`
				: `${First}${TSep}${string}`
		: string;

export { joinSimple };
export type { Join, JoinSimple };
