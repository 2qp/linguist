import { createFieldSet } from "@gen/utils/create-field-set";

import type { Field } from "@/types/branded.types";
import type { Config } from "@/types/config.types";
import type { FieldAnalysis, FieldAnalysisArray } from "@/types/field.types";
import type { Primitive } from "@/types/gen.types";
import type { LanguageData } from "@/types/lang.types";
import type { WithPhase } from "@/types/phantom.types";
import type { Ref } from "./create-reference";

type AnalyzeFieldsParams<TSource extends LanguageData> = {
	source: TSource;
	config: Config;
	ref: Ref;
};

// type AnalyzeFieldsType = <T extends LanguageData, TField extends keyof T[keyof T] = Field>(
// 	params: AnalyzeFieldsParams<T>,
// ) => FieldAnalysisMap<TField>;

type AnalyzeFieldsOverloaded = {
	<TSource extends LanguageData, TField extends keyof TSource[keyof TSource]>(
		params: AnalyzeFieldsParams<TSource> & WithPhase<"transform">,
	): FieldAnalysisArray<TField>;

	<TSource extends LanguageData>(
		params: AnalyzeFieldsParams<TSource> & Partial<WithPhase<"generate">>,
	): FieldAnalysisArray<Field>;
};

const analyzeFields: AnalyzeFieldsOverloaded = <TSource extends LanguageData>({
	source,
	config,
	ref,
}: AnalyzeFieldsParams<TSource>) => {
	//

	const languages = Object.values(source);

	const allKeys = createFieldSet({ source, config });
	const uniqueKeys = [...new Set(allKeys)];
	const allFields = uniqueKeys.sort();

	const fieldAnalyses = allFields.map((field) => {
		const fieldEntries = languages.map((lang) => lang[field]);

		const definedEntries = fieldEntries.filter((value) => value !== undefined);
		const isOptional = definedEntries.length < fieldEntries.length;
		const languagesUsing = definedEntries.length;
		const totalOccurrences = languagesUsing;

		const arrayItems = definedEntries.flatMap((value) => (Array.isArray(value) ? value : []));
		const nonArrayValues = definedEntries.filter((value) => !Array.isArray(value));

		const isArray = definedEntries.some((value) => Array.isArray(value));
		const isBoolean = nonArrayValues.some((v) => typeof v === "boolean");
		const isNumber = nonArrayValues.some((v) => typeof v === "number");
		const isString = nonArrayValues.some((v) => typeof v === "string");

		const uniqueValues = new Set<Primitive>([...nonArrayValues, ...arrayItems]);

		const sampleValues = [...uniqueValues].slice(0, 5);

		const itemTypes = new Set<string>(arrayItems.map((item) => typeof item));

		const itemType: "string" | "number" | "boolean" | "mixed" =
			itemTypes.size === 1
				? ((): "string" | "number" | "boolean" | "mixed" => {
						const t = Array.from(itemTypes)[0];
						return t === "string" || t === "number" || t === "boolean" ? t : "mixed";
					})()
				: "mixed";

		const uniqueCount = uniqueValues.size;

		const isPureType =
			(isString && !isNumber && !isBoolean) ||
			(isNumber && !isString && !isBoolean) ||
			(isBoolean && !isString && !isNumber);

		const shouldBeLiteral = !isArray && isPureType && uniqueCount > 0 && uniqueCount <= config.type.maxLiteralValues;
		const shouldBeLiteralArray =
			isArray && uniqueCount > 0 && uniqueCount <= config.type.maxArrayLiteralItems && itemType !== "mixed";

		const uid = ref.fieldToUid.get(field);
		if (!uid) throw new Error(`unable to find UID "${uid}" for "${field}"`);

		const analysis: FieldAnalysis = {
			isOptional,
			isArray,
			isBoolean,
			isNumber,
			isString,
			uniqueValues,
			totalOccurrences,
			languagesUsing,
			itemType,
			shouldBeLiteral,
			shouldBeLiteralArray,
			sampleValues,
			uid,
		};

		return [field, analysis] as const;
	});

	return fieldAnalyses;
};

export { analyzeFields };
export type { AnalyzeFieldsParams };
