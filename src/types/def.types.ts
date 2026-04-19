import type { ElementBase } from "./field.types";
import type {
	ArrayTypeDef,
	EleExpr,
	EleListExpr,
	Flex,
	IdType,
	Primitive,
	SelfPair,
	TEleExpr,
	TEleListExpr,
} from "./gen.types";
import type { SegmentDef } from "./segment.types";

type TypeDefUnion<T extends Primitive> = `"${T}" | "${T}"`;

type PipeUnion<T extends Primitive> = `${T} | ${T}`;

type InLineExpr<T extends Primitive, TBase extends ElementBase> = EleExpr<TypeDefUnion<T>, TBase>;

type InLineListExpr<T extends Primitive, TBase extends ElementBase> = ArrayTypeDef<EleExpr<TypeDefUnion<T>, TBase>>;

type InLineUnionEleListExpr<T extends Primitive, TBase extends ElementBase> = EleListExpr<PipeUnion<T>, TBase>;

type SplitTypeDef<TName extends string, TBase extends ElementBase = "string"> = Readonly<
	`((${IdType<TName>} | ${IdType<TName>}) | (${Flex<TBase>}))[]` | `(${IdType<TName>} | ${IdType<TName>})[]`
>;

type SplitReadonlyTypeDef<TName extends string, TBase extends ElementBase = "string"> = Readonly<
	| `readonly ((${IdType<TName>} | ${IdType<TName>}) | (${Flex<TBase>}))[]`
	| `readonly (${IdType<TName>} | ${IdType<TName>})[]`
>;

type LiteralSegment<TName extends string, TBase extends ElementBase = "string"> = Readonly<
	`((${IdType<TName>} | ${IdType<TName>}) | (${Flex<TBase>}))` | `(${IdType<TName>} | ${IdType<TName>})`
>;

type ElementBaseDef<TBase extends ElementBase = ElementBase> =
	| (TEleExpr<TBase & {}> & {})
	| (TEleListExpr<TBase & {}> & {});

type Literals = SelfPair<ElementBase, { left: false; outer: false; right: true }>;

type Bools = `${true}` | `${false}`;

type TypeDef<TName extends string, T extends Primitive, TBase extends ElementBase> =
	| ((SplitTypeDef<TName, TBase> & {}) | (SplitReadonlyTypeDef<TName, TBase> & {}))
	| (ArrayTypeDef<TBase> & {})
	| (InLineExpr<T, TBase> & {})
	| (InLineListExpr<T, TBase> & {})
	| (InLineUnionEleListExpr<T, TBase> & {})
	| (LiteralSegment<TName, TBase> & {})
	| (ElementBaseDef & {})
	// | `${T}`
	| `${ElementBase}`
	| `${Literals}`
	| Bools
	| `${"unknown"}`
	| (ArrayTypeDef<"unknown"> & {});

type GeneratedDefs<
	T extends Primitive = Primitive,
	TName extends string = string,
	TBase extends ElementBase = ElementBase,
> = {
	typeDef: TypeDef<TName, T, TBase> & {};
	// woah w/o Prettify :0

	segmentDefs: ReadonlyArray<SegmentDef<T[][], TName>>;

	/**
	 * `"AceMode"`, `"Aliases"`...
	 */
	type: string;
};

// type TypeDefx<TName extends string, T extends Primitive, TBase extends ElementBase> =
// 	| ((SplitTypeDef<TName, TBase> & {}) | (SplitReadonlyTypeDef<TName, TBase> & {}))
// 	| (ArrayTypeDef<TBase> & {})
// 	| (InLineExpr<T, TBase> & {})
// 	| (InLineListExpr<T, TBase> & {})
// 	| (ElementBaseDef & {})
// 	| `${T}`
// 	| `${ElementBase}`
// 	| `${Literals}`
// 	| `${"any"}`
// 	| (ArrayTypeDef<"any"> & {});

// type Gen<T extends Primitive, TName extends string, TBase extends ElementBase = ElementBase> = {
// 	typeDef: TypeDefx<TName, T, TBase> & {};
// };

// const name = `LANG` as const;

// const t = `string` as const;

// type c = Gen<string, typeof name, ElementBase>;

export type { GeneratedDefs };
