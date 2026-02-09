type JoinType = <T extends readonly string[], TSep extends string>(arr: T, sep: TSep) => JoinRelaxed<T, TSep>;

const join: JoinType = (arr, sep) => arr.join(sep) as JoinRelaxed<typeof arr, typeof sep>;

type JoinRelaxed<T extends readonly string[], TSep extends string> = T extends readonly []
	? ""
	: T extends readonly [
				infer First extends string,
				infer Second extends string,
				...infer Rest extends readonly string[],
			]
		? Rest extends []
			? `${First}${TSep}${Second}`
			: `${First}${TSep}${JoinRelaxed<[Second, ...Rest], TSep>}`
		: T extends readonly [infer Single extends string]
			? Single
			: T extends ReadonlyArray<infer Element extends string>
				? `${Element}${TSep}${Element}`
				: string;

export { join };
export type { JoinType };
