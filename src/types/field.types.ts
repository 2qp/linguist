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
	type: string;
};

type FieldAnalysisMap = Map<Field, FieldAnalysis>;

type ElementType = "string" | "number" | "boolean" | "mixed";
type ElementBase = Exclude<ElementType, "mixed">;

export type { FieldAnalysis, FieldAnalysisMap, ElementType, ElementBase };
