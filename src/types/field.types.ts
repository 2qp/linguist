import type { Field, UID } from "./branded.types";
import type { Primitive } from "./gen.types";

type FieldAnalysis<TUnique extends Primitive = Primitive> = {
	isOptional: boolean;
	isArray: boolean;
	isBoolean: boolean;
	isNumber: boolean;
	isString: boolean;
	uniqueValues: Set<TUnique>;
	totalOccurrences: number;
	languagesUsing: number;
	itemType?: ElementType;
	shouldBeLiteral: boolean;
	shouldBeLiteralArray: boolean;
	sampleValues: unknown[];

	uid: UID;
};

type ProcessedFieldAnalysis<TUnique extends Primitive = Primitive> = FieldAnalysis<TUnique> & {
	/**
	 * `"AceMode"`, `"Aliases"`...
	 */
	type: string;
};

type FieldAnalysisMap<TField = Field, TUnique extends Primitive = Primitive> = Map<TField, FieldAnalysis<TUnique>>;
type ProcessedFieldAnalysisMap<TField = Field, TUnique extends Primitive = Primitive> = Map<
	TField,
	ProcessedFieldAnalysis<TUnique>
>;

type ElementType = "string" | "number" | "boolean" | "mixed";
type ElementBase = Exclude<ElementType, "mixed">;

export type {
	ElementBase,
	ElementType,
	FieldAnalysis,
	FieldAnalysisMap,
	ProcessedFieldAnalysis,
	ProcessedFieldAnalysisMap,
};
