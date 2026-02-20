import { processFields } from "./utils/process-fields";
import { emitAutogenHeader } from "@/emit/emit-autogen-header";
import { emitLanguagePropertyTypeName } from "@/emit/emit-language-property-type-name";
import { emitLanguageType } from "@/emit/emit-language-type";
import { emitSecondaryTypes } from "@/emit/emit-secondary-types";
import { emitSegmentSection } from "@/emit/emit-segment-section";
import { emitStats } from "@/emit/emit-stats";
import { emitTypesSection } from "@/emit/emit-types-sections";
import { emitTypeSafeAccessors } from "@/emit/emit-typesafe-accessors";
import { emitUtilityTypes } from "@/emit/emit-utility-types";

import type { Meta } from "@core/create-meta";
import type { Ref } from "@core/create-reference";
import type { Field } from "@/types/branded.types";
import type { Config } from "@/types/config.types";
import type { FieldAnalysisArray } from "@/types/field.types";
import type { Primitive } from "@/types/gen.types";
import type { LanguageData } from "@/types/lang.types";

type GenerateDynamicTypesParams<
	TSource extends Record<string, unknown> = LanguageData,
	TField extends string = Field,
	TUnique extends Primitive = Primitive,
> = {
	config: Config;
	source: TSource;
	ref: Ref;
	meta: Meta;
	stats: FieldAnalysisArray<TField, TUnique>;
};

type GenerateDynamicTypesType = (params: GenerateDynamicTypesParams) => string;

const generateDynamicTypes: GenerateDynamicTypesType = ({ config: base, source, meta, ref, stats }) => {
	//

	const config = { ...base, type: { ...base.type, secondary: { ...base.type.secondary, enabled: false } } };

	//

	const fields = processFields({
		fields: stats,
		config,
		meta,
		ref,
	});

	const name = config.type.naming.languageName;

	// OUTPUTS
	const output_header = emitAutogenHeader(config.core.name, config, meta);

	const output_segments = emitSegmentSection(fields.allSegmentDefinitions);

	const output_sorted_types = emitTypesSection(fields.generatedTypes, name);

	const output_language_type = emitLanguageType({
		stats: fields.updatedFields,
		types: fields.generatedTypes,
		config,
		ref,
	});

	const output_utility_types = emitUtilityTypes(name);

	const output_typesafe_accessors = emitTypeSafeAccessors(name);
	// const output_validation_helpers = emitValidationHelpers(LANGUAGE_NAME);

	const secondary = emitSecondaryTypes({ config: base, source, stats, ref, meta });

	const output_typeNames = emitLanguagePropertyTypeName({ types: fields.generatedTypes, config });

	const output = [
		output_header,
		//
		output_segments,
		output_sorted_types,
		output_language_type,

		//
		...secondary,

		//
		output_utility_types,
		output_typeNames,
		output_typesafe_accessors,
	].join("");

	if (config.type.showFieldStats) {
		//

		const stats_output = emitStats({
			fields,
			meta,
			config: base,
		});

		return [output, stats_output].join("");
	}

	return output;
};

export { generateDynamicTypes };
export type { GenerateDynamicTypesParams, GenerateDynamicTypesType };
