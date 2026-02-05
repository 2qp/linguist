import { generateUniqueTypeName } from "./generate-unique-type-name";
import { getMappedFieldOrType } from "./get-mapped-field-or-type";
import { generateFieldType } from "@gen/generate-field-type";

import type { Config } from "@/types/config.types";
import type { FieldAnalysis } from "@/types/field.types";
import type { Primitive } from "@/types/gen.types";
import type { OutputDefs, OutputMap } from "@/types/output.types";

type ProcessFieldsParams<TUnique extends Primitive> = {
	fields: Array<[string, FieldAnalysis<TUnique>]>;
	totalLanguages: number;
	existing: Existing;
	config: Config;
	existingNames: Set<string>;
};

type Existing = {
	types: OutputMap;
	segments: string[];
};

type ProcessFieldsReturnType<TUnique extends Primitive> = {
	generatedTypes: OutputMap;
	allSegmentDefinitions: string[];
	updatedExistingNames: Set<string>;
	updatedFields: Array<[string, FieldAnalysis<TUnique>]>;
};

type ProcessFieldsType = <TUnique extends Primitive>(
	params: ProcessFieldsParams<TUnique>,
) => ProcessFieldsReturnType<TUnique>;

const processFields: ProcessFieldsType = ({ fields, existing, totalLanguages, config, existingNames }) => {
	//

	if (fields.length === 0 || fields[0] === undefined) {
		return {
			generatedTypes: new Map(existing.types),
			allSegmentDefinitions: [...existing.segments],
			updatedExistingNames: existingNames,
			updatedFields: [],
		};
	}

	const [[field, stats], ...remainingFields] = fields;

	const usagePercent = ((stats.languagesUsing / totalLanguages) * 100).toFixed(1);

	const shouldGenerateType =
		(stats.shouldBeLiteral || stats.shouldBeLiteralArray) &&
		stats.languagesUsing >= config.type.minLanguagesForNamedType &&
		parseFloat(usagePercent) >= config.type.minUsagePercent;

	if (!shouldGenerateType) {
		return processFields({ fields: remainingFields, config, existing, totalLanguages, existingNames });
	}

	const res = getMappedFieldOrType({ value: field, from: "field", to: "type", remapper: config.type.naming.fields });

	const baseTypeName = res.resolved
		? res.value
		: field
				.split(/[^a-zA-Z0-9]+/)
				.filter((word) => word.length > 0)
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
				.join("");

	const isStrict = config.type.strict;
	const prefix = isStrict ? config.type.naming.strictPrefix : "";

	const typeNameKey = generateUniqueTypeName(`${prefix}${baseTypeName}`, existingNames);

	const typeName = generateUniqueTypeName(baseTypeName, existingNames);
	const updatedNames = new Set(existingNames).add(typeName);

	const newStats = { ...stats, typeName };

	const result = generateFieldType({ field, stats: newStats, typeName, config });

	const remainingResult = processFields({
		fields: remainingFields,
		existingNames: updatedNames,
		config,
		existing,
		totalLanguages,
	});

	return {
		generatedTypes: new Map<string, OutputDefs>([
			[typeNameKey, { typeDef: result.typeDef, segmentDefs: result.segmentDefs }],
			...existing.types,
			...remainingResult.generatedTypes,
		]),
		allSegmentDefinitions: [...result.segmentDefs, ...remainingResult.allSegmentDefinitions, ...existing.segments],
		updatedExistingNames: remainingResult.updatedExistingNames,
		updatedFields: [...remainingResult.updatedFields, [field, newStats]],
	};
};

export { processFields };
export type { Existing, ProcessFieldsParams, ProcessFieldsType };
