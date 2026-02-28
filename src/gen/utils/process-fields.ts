import { generateUniqueTypeName } from "./generate-unique-type-name";
import { getMappedFieldOrType } from "./get-mapped-field-or-type";
import { createSecondaryName } from "./misc/create-secondary-name";
import { generateFieldType } from "@gen/generate-field-type";
import { normalizeName } from "@/transform/utils/normalize-name";

import type { Meta } from "@core/create-meta";
import type { Ref } from "@core/create-reference";
import type { Field, UID } from "@/types/branded.types";
import type { Config } from "@/types/config.types";
import type { Role } from "@/types/core.types";
import type { FieldAnalysisArray, ProcessedFieldAnalysis, ProcessedFieldAnalysisArray } from "@/types/field.types";
import type { Primitive } from "@/types/gen.types";
import type { OutputDefs, OutputMap } from "@/types/output.types";
import type { ExtractSetElement } from "@/types/utility.types";

type ProcessFieldsParams<TField extends string = Field, TUnique extends Primitive = Primitive> = {
	stats: FieldAnalysisArray<TField, TUnique>;
	config: Config;
	existing?: Existing<TUnique>;
	existingNames?: Set<string>;
	ref?: Ref | undefined;
	meta: Meta;
	_role?: Role;
};

type Existing<TUnique extends Primitive = Primitive> = {
	types: OutputMap<TUnique>;
	segments: string[];
};

type ProcessFieldsReturnType<TField = Field, TUnique extends Primitive = Primitive> = {
	generatedTypes: OutputMap<TUnique>;
	allSegmentDefinitions: string[];
	updatedExistingNames: Set<string>;
	stats: ProcessedFieldAnalysisArray<TField, TUnique>;
};

type ProcessFieldsType = <TField extends string = Field, TUnique extends Primitive = Primitive>(
	params: ProcessFieldsParams<TField, TUnique>,
) => ProcessFieldsReturnType<TField, TUnique>;

const processFields: ProcessFieldsType = ({
	stats,
	config,
	meta,
	ref,
	existingNames = new Set(),
	existing = {
		segments: [],
		types: new Map<UID, OutputDefs<ExtractSetElement<(typeof stats)[0][1]["uniqueValues"]>>>(),
	},
	_role = "primary",
}) => {
	//

	if (stats.length === 0 || stats[0] === undefined) {
		return {
			generatedTypes: new Map(existing.types),
			allSegmentDefinitions: [...existing.segments],
			updatedExistingNames: existingNames,
			stats: [],
		};
	}

	const [[field, stat], ...remainingFields] = stats;

	const usagePercent = ((stat.languagesUsing / meta.languageCount) * 100).toFixed(1);

	const shouldGenerateType =
		(stat.shouldBeLiteral || stat.shouldBeLiteralArray) &&
		stat.languagesUsing >= config.type.minLanguagesForNamedType &&
		parseFloat(usagePercent) >= config.type.minUsagePercent;

	if (!shouldGenerateType) {
		return processFields({ stats: remainingFields, config, existing, existingNames, ref, meta, _role });
	}

	const res = getMappedFieldOrType({ value: field, from: "field", to: "type", remapper: config.type.naming.fields });

	const segmentBaseTypeName = res.resolved ? res.value : normalizeName(field).constant;
	const segmentOwnerBaseTypeName = res.resolved ? res.value : normalizeName(field).typeName;

	const secondary = _role === "secondary" && config.type.secondary.enabled;

	const baseName = createSecondaryName({
		name: segmentOwnerBaseTypeName,
		config,
		_prefix: secondary,
		_suffix: secondary,
	});

	const typeNameKey = generateUniqueTypeName(baseName, existingNames);

	const typeName = generateUniqueTypeName(segmentBaseTypeName, existingNames);
	const updatedNames = new Set(existingNames).add(typeName);

	const newStats: ProcessedFieldAnalysis<ExtractSetElement<(typeof stats)[0][1]["uniqueValues"]>> = {
		...stat,
		type: typeNameKey,
	};

	const result = generateFieldType({ stats: newStats, typeName, config });

	const uid = ref?.fieldToUid.get(field as unknown as Field);
	if (!uid) throw new Error(`unable to find UID for field: "${field}" ~ "${typeNameKey}"`);

	const remainingResult = processFields({
		stats: remainingFields,
		existingNames: updatedNames,
		config,
		existing,
		meta,
		ref,
		_role,
	});

	return {
		generatedTypes: new Map<UID, OutputDefs<ExtractSetElement<typeof stat.uniqueValues>>>([
			[uid, { typeDef: result.typeDef, segmentDefs: result.segmentDefs, type: typeNameKey } as const],
			...existing.types,
			...remainingResult.generatedTypes,
		] as const),
		allSegmentDefinitions: [...result.segmentDefs, ...remainingResult.allSegmentDefinitions, ...existing.segments],
		updatedExistingNames: remainingResult.updatedExistingNames,
		stats: [[field, newStats], ...remainingResult.stats],
	};
};

export { processFields };
export type { Existing, ProcessFieldsParams, ProcessFieldsReturnType, ProcessFieldsType };
