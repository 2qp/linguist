type UnionToIntersection<U> = (U extends unknown ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

type LastOfUnion<U> = UnionToIntersection<U extends unknown ? () => U : never> extends () => infer L ? L : never;

type JoinUnion<U extends string, Acc extends string = ""> = [U] extends [never]
	? Acc
	: LastOfUnion<U> extends infer L extends string
		? JoinUnion<Exclude<U, L>, `${Acc}${L}`>
		: never;

export type { JoinUnion, LastOfUnion, UnionToIntersection };
