import { processFields } from "./utils/process-fields";
import { analyzeFields } from "@core/analyze-fields";
import { createReference } from "@core/create-reference";
import { emitAutogenHeader } from "@/emit/emit-autogen-header";
import { emitLanguagePropertyTypeName } from "@/emit/emit-language-property-type-name";
import { emitLanguageType } from "@/emit/emit-language-type";
import { emitSecondaryTypes } from "@/emit/emit-secondary-types";
import { emitSegmentSection } from "@/emit/emit-segment-section";
import { emitStats } from "@/emit/emit-stats";
import { emitTypesSection } from "@/emit/emit-types-sections";
import { emitTypeSafeAccessors } from "@/emit/emit-typesafe-accessors";
import { emitUtilityTypes } from "@/emit/emit-utility-types";

import type { Config } from "@/types/config.types";
import type { LanguageData } from "@/types/lang.types";

type GenerateDynamicTypesParams<TSource extends Record<string, unknown> = LanguageData> = {
	config: Config;
	source: TSource;
};

type GenerateDynamicTypesType = (params: GenerateDynamicTypesParams) => string;

const generateDynamicTypes: GenerateDynamicTypesType = ({ config: base, source }) => {
	//

	const config = { ...base, type: { ...base.type, secondary: { ...base.type.secondary, enabled: false } } };

	const ref = createReference({ config, source });

	const fieldStats = analyzeFields({ source, config, ref });

	//

	const keys = Object.keys(source);
	const totalLanguages = keys.length;
	const languageNames = keys.sort();

	const fieldsArray = [...fieldStats].sort();

	const fields = processFields({
		fields: fieldsArray,
		totalLanguages,
		config,
		ref,
	});

	const newFieldStats = new Map(fields.updatedFields);

	const name = config.type.naming.languageName;

	// OUTPUTS
	const output_header = emitAutogenHeader(config.core.name, config, {
		size: fieldStats.size,
		total: totalLanguages,
	});

	const output_segments = emitSegmentSection(fields.allSegmentDefinitions);

	const output_sorted_types = emitTypesSection(fields.generatedTypes, name);

	const output_language_type = emitLanguageType({
		stats: newFieldStats,
		types: fields.generatedTypes,
		config,
		ref,
	});

	const output_utility_types = emitUtilityTypes(name);

	const output_typesafe_accessors = emitTypeSafeAccessors(name);
	// const output_validation_helpers = emitValidationHelpers(LANGUAGE_NAME);

	const secondary = emitSecondaryTypes({ config: base, data: source, stats: fieldStats, ref });

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

		const stats = emitStats({
			map: fieldStats,
			types: fields.generatedTypes,
			config: base,
			langs: languageNames,
			totals: { size: fieldStats.size, total: totalLanguages },
		});

		return [output, stats].join("");
	}

	return output;
};

export { generateDynamicTypes };
export type { GenerateDynamicTypesParams, GenerateDynamicTypesType };
