import { processFields } from "./utils/process-fields";
import { analyzeFields } from "@core/analyze-fields";
import { emitAutogenHeader } from "@/emit/emit-autogen-header";
import { emitLanguageType } from "@/emit/emit-language-type";
import { emitSecondaryTypes } from "@/emit/emit-secondary-types";
import { emitSegmentSection } from "@/emit/emit-segment-section";
import { emitStats } from "@/emit/emit-stats";
import { emitTypesSection } from "@/emit/emit-types-sections";
import { emitTypeSafeAccessors } from "@/emit/emit-typesafe-accessors";
import { emitUtilityTypes } from "@/emit/emit-utility-types";

import type { Config } from "@/types/config.types";
import type { GeneratedDefs } from "@/types/def.types";
import type { LanguageName } from "@/types/identifiers.types";
import type { LanguageData } from "@/types/lang.types";
import type { Existing } from "./utils/process-fields";

type GenerateDynamicTypesParams = {
	config: Config;
	data?: LanguageData | undefined;
};

type GenerateDynamicTypesType = (params: GenerateDynamicTypesParams) => string;

const generateDynamicTypes: GenerateDynamicTypesType = ({ config: base, data }) => {
	//

	const config = { ...base, type: { ...base.type, secondary: { ...base.type.secondary, enabled: false } } };

	if (!data) throw Error("Unable load yaml data");

	const fieldStats = analyzeFields({ data, config });

	const keys = Object.keys(data);
	const totalLanguages = keys.length;
	const languageNames = keys.sort();

	// const languageNameResult = generateLanguageNameType({
	// 	languageNames,
	// 	typeName: LANGUAGE_NAME,
	// 	baseType: "string" as const,
	// 	config: { ...config, type: { ...config.type, useReadonlyArrays: false } },
	// });

	const existingTypes = new Map<string, GeneratedDefs<string, LanguageName>>([
		// [LANGUAGE_NAME, { segmentDefs: languageNameResult.segmentDefs, typeDef: languageNameResult.typeDef }],
	]);

	const existing: Existing = {
		// segments: [...languageNameResult.segmentDefs],
		segments: [],
		types: existingTypes,
	};

	const fieldsArray = [...fieldStats].sort();
	const existingNames = new Set([]);
	const fields = processFields({
		fields: fieldsArray,
		totalLanguages,
		existing,
		config,
		existingNames,
	});

	const newFieldStats = new Map(fields.updatedFields);

	const name = config.type.naming.languageName;

	// OUTPUTS
	const output_header = emitAutogenHeader(config.core.name, config, {
		size: fieldStats.size,
		total: totalLanguages,
	});

	const output_segments = emitSegmentSection(fields.allSegmentDefinitions);

	const output_lang_name_export = fields.generatedTypes.has(name)
		? `export type ${name} = ${fields.generatedTypes.get(name)?.typeDef};\n`
		: "";

	const output_sorted_types = emitTypesSection(fields.generatedTypes, name);

	const output_language_type = emitLanguageType({
		stats: newFieldStats,
		types: fields.generatedTypes,
		config,
	});

	const output_utility_types = emitUtilityTypes(name);

	const output_typesafe_accessors = emitTypeSafeAccessors(name);
	// const output_validation_helpers = emitValidationHelpers(LANGUAGE_NAME);

	// STRICT
	const secondary = emitSecondaryTypes({ config: base, data, stats: fieldStats });

	const output = [
		output_header,
		//
		output_segments,
		output_lang_name_export,
		output_sorted_types,
		output_language_type,

		//
		...secondary,

		//
		output_utility_types,
		output_typesafe_accessors,
	].join("");

	if (config.type.showFieldStats) {
		//

		const stats = emitStats({
			map: fieldStats,
			types: fields.generatedTypes,
			config,
			langs: languageNames,
			totals: { size: fieldStats.size, total: totalLanguages },
		});

		return [output, stats].join("");
	}

	return output;
};

export { generateDynamicTypes };
export type { GenerateDynamicTypesParams, GenerateDynamicTypesType };
