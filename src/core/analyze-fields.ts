import type { Config } from "@/types/config.types";
import type { FieldAnalysis, FieldAnalysisMap } from "@/types/field.types";
import type { Primitive } from "@/types/gen.types";
import type { LanguageData, LanguageFields } from "@/types/lang.types";

type AnalyzeFieldsParams = {
	data: LanguageData;
	config: Config;
};

type AnalyzeFieldsType = (params: AnalyzeFieldsParams) => FieldAnalysisMap;

const analyzeFields: AnalyzeFieldsType = ({ data, config }) => {
	//

	// const languagesx = Object.values(data);
	const languages = Object.entries(data).map(
		([name, value]) =>
			({
				name,
				...value,
			}) as LanguageFields satisfies LanguageFields,
	);

	const allKeys = languages.flatMap((obj) => Object.keys(obj));
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
		};

		return [field, analysis] as const;
	});

	return new Map(fieldAnalyses);
};

export { analyzeFields };
export type { AnalyzeFieldsParams, AnalyzeFieldsType };
