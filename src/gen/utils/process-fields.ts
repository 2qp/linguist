import { generateUniqueTypeName } from "./generate-unique-type-name";
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

type ProcessFieldsReturnType = {
	generatedTypes: OutputMap;
	allSegmentDefinitions: string[];
	updatedExistingNames: Set<string>;
};

type ProcessFieldsType = <TUnique extends Primitive>(params: ProcessFieldsParams<TUnique>) => ProcessFieldsReturnType;

const processFields: ProcessFieldsType = ({ fields, existing, totalLanguages, config, existingNames }) => {
	//

	if (fields.length === 0 || fields[0] === undefined) {
		return {
			generatedTypes: new Map(existing.types),
			allSegmentDefinitions: [...existing.segments],
			updatedExistingNames: existingNames,
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

	const baseTypeName = field
		.split(/[^a-zA-Z0-9]+/)
		.filter((word) => word.length > 0)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join("");

	const typeName = generateUniqueTypeName(baseTypeName, existingNames);
	const updatedNames = new Set(existingNames).add(typeName);

	const result = generateFieldType({ field, stats, typeName, config });

	const remainingResult = processFields({
		fields: remainingFields,
		existingNames: updatedNames,
		config,
		existing,
		totalLanguages,
	});

	return {
		generatedTypes: new Map<string, OutputDefs>([
			[typeName, { typeDef: result.typeDef, segmentDefs: result.segmentDefs }],
			...existing.types,
			...remainingResult.generatedTypes,
		]),
		allSegmentDefinitions: [...result.segmentDefs, ...remainingResult.allSegmentDefinitions, ...existing.segments],
		updatedExistingNames: remainingResult.updatedExistingNames,
	};
};

export { processFields };
export type { Existing, ProcessFieldsParams, ProcessFieldsType };
