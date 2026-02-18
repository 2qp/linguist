import { generateUniqueTypeName } from "./generate-unique-type-name";
import { getMappedFieldOrType } from "./get-mapped-field-or-type";
import { generateFieldType } from "@gen/generate-field-type";
import { normalizeName } from "@/transform/utils/normalize-name";

import type { Ref } from "@core/create-reference";
import type { Field, UID } from "@/types/branded.types";
import type { Config } from "@/types/config.types";
import type { FieldAnalysis, ProcessedFieldAnalysis } from "@/types/field.types";
import type { Primitive } from "@/types/gen.types";
import type { OutputDefs, OutputMap } from "@/types/output.types";
import type { ExtractSetElement } from "@/types/utility.types";

type ProcessFieldsParams<TField extends string = Field, TUnique extends Primitive = Primitive> = {
	fields: Array<[TField, FieldAnalysis<TUnique>]>;
	totalLanguages: number;
	config: Config;
	existing?: Existing<TUnique>;
	existingNames?: Set<string>;
	ref?: Ref | undefined;
};

type Existing<TUnique extends Primitive = Primitive> = {
	types: OutputMap<TUnique>;
	segments: string[];
};

type ProcessFieldsReturnType<TField = Field, TUnique extends Primitive = Primitive> = {
	generatedTypes: OutputMap<TUnique>;
	allSegmentDefinitions: string[];
	updatedExistingNames: Set<string>;
	updatedFields: Array<[TField, ProcessedFieldAnalysis<TUnique>]>;
};

type ProcessFieldsType = <TField extends string = Field, TUnique extends Primitive = Primitive>(
	params: ProcessFieldsParams<TField, TUnique>,
) => ProcessFieldsReturnType<TField, TUnique>;

const processFields: ProcessFieldsType = ({
	fields,
	config,
	totalLanguages,
	existingNames = new Set(),
	ref,
	existing = {
		segments: [],
		types: new Map<UID, OutputDefs<ExtractSetElement<(typeof fields)[0][1]["uniqueValues"]>>>(),
	},
}) => {
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

	const segmentBaseTypeName = res.resolved ? res.value : normalizeName(field).constant;
	const segmentOwnerBaseTypeName = res.resolved ? res.value : normalizeName(field).typeName;

	const secondary = config.type.secondary.enabled;
	const prefix = secondary ? config.type.naming.secondaryPrefix : "";

	const typeNameKey = generateUniqueTypeName(`${prefix}${segmentOwnerBaseTypeName}`, existingNames);

	const typeName = generateUniqueTypeName(segmentBaseTypeName, existingNames);
	const updatedNames = new Set(existingNames).add(typeName);

	const newStats: ProcessedFieldAnalysis<ExtractSetElement<(typeof fields)[0][1]["uniqueValues"]>> = {
		...stats,
		type: typeNameKey,
	};

	const result = generateFieldType({ field, stats: newStats, typeName, config });

	const uid = ref?.fieldToUid.get(field as unknown as Field);
	if (!uid) throw new Error(`unable to find UID for field: "${field}" ~ "${typeNameKey}"`);

	const remainingResult = processFields({
		fields: remainingFields,
		existingNames: updatedNames,
		config,
		existing,
		totalLanguages,
		ref,
	});

	return {
		generatedTypes: new Map<UID, OutputDefs<ExtractSetElement<typeof stats.uniqueValues>>>([
			[uid, { typeDef: result.typeDef, segmentDefs: result.segmentDefs, type: typeNameKey } as const],
			...existing.types,
			...remainingResult.generatedTypes,
		] as const),
		allSegmentDefinitions: [...result.segmentDefs, ...remainingResult.allSegmentDefinitions, ...existing.segments],
		updatedExistingNames: remainingResult.updatedExistingNames,
		updatedFields: [[field, newStats], ...remainingResult.updatedFields],
	};
};

export { processFields };
export type { Existing, ProcessFieldsParams, ProcessFieldsType };
