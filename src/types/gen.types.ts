import type { ElementBase } from "./field.types";

type Primitive = string | number | bigint | boolean;

type Flex<T extends ElementBase = "string"> = `${T} & {}`;

type EleExpr<T extends Primitive, TBase extends ElementBase = "string"> = `((${T}) | (${Flex<TBase>}))` | `(${T})`;

type EleListExpr<T extends Primitive, TBase extends ElementBase> = ArrayTypeDef<EleExpr<T, TBase>>;

type Parenthesize<T extends Primitive> = `(${T})`;

type QuoteString<T> = T extends string ? `"${T}"` : T extends Exclude<Primitive, string> ? T : never;

// type SelfPair<T extends ElementBase = ElementBase> = {
// 	[K in T]: `${Parenthesize<K>} | ${Parenthesize<Flex<K>>}`;
// }[T] & {};

type MaybeParen<T extends Primitive, Should extends boolean = false> = Should extends true ? Parenthesize<T> : T;

type SelfPairOpts = {
	left?: boolean; // (base)
	right?: boolean; // (flex)
	outer?: boolean; // (whole)
};

type SelfPair<T extends ElementBase = ElementBase, Options extends SelfPairOpts = never> = {
	[K in T]: MaybeParen<
		`${MaybeParen<K, Options["left"] extends boolean ? Options["left"] : false>} | ${MaybeParen<Flex<K>, Options["right"] extends boolean ? Options["right"] : false>}`,
		Options["outer"] extends boolean ? Options["outer"] : false
	>;
}[T] & {};

type TEleExpr<T extends ElementBase = ElementBase> =
	| `${Parenthesize<SelfPair<T, { left: true; right: true; outer: false }> & {}>}`
	| `${Parenthesize<T>}`;

type TEleListExpr<T extends ElementBase = ElementBase> = ArrayTypeDef<TEleExpr<T>>;

type Capitalized<Str extends string> = Uppercase<Str>;

type NameId<TName extends string> = `${Capitalized<TName>}_${number}`;

type SegmentDef<T extends Primitive, TName extends string> = `const ${NameId<TName>} = [${T}, ${T}] as const;`;

type IdElement<TName extends string> = `${NameId<TName>}[number]`;

type IdType<TName extends string> = `typeof ${IdElement<TName>}`;

type ListExpr<T extends Primitive> = `${T}[]`;

type ReadonlyExpr<T extends Primitive> = `readonly ${T}`;

type ReadonlyListExpr<T extends Primitive> = `${ListExpr<ReadonlyExpr<T>>}`;

type ArrayTypeDef<T extends Primitive> = `${ReadonlyListExpr<T>}` | `${ListExpr<T>}`;

export type {
	ArrayTypeDef,
	Capitalized,
	EleExpr,
	EleListExpr,
	Flex,
	IdElement,
	IdType,
	NameId,
	Parenthesize,
	Primitive,
	QuoteString,
	SegmentDef,
	SelfPair,
	TEleExpr,
	TEleListExpr,
};
