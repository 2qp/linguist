import { generateLanguageNameType } from "./generate-language-name-type";
import { processFields } from "./utils/process-fields";
import { analyzeFields } from "@core/analyze-fields";
import { LANGUAGE_NAME, SOURCE_FILE_NAME } from "@/constants/identifiers";
import { emitAutogenHeader } from "@/emit/emit-autogen-header";
import { emitLanguageType } from "@/emit/emit-language-type";
import { emitSegmentSection } from "@/emit/emit-segment-section";
import { emitStats } from "@/emit/emit-stats";
import { emitTypesSection } from "@/emit/emit-types-sections";
import { emitTypeSafeAccessors } from "@/emit/emit-typesafe-accessors";
import { emitUtilityTypes } from "@/emit/emit-utility-types";
import { emitValidationHelpers } from "@/emit/emit-validation-helpers";

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

const generateDynamicTypes: GenerateDynamicTypesType = ({ config, data }) => {
	//

	if (!data) throw Error("Unable load yaml data");

	const fieldStats = analyzeFields({ data, config });

	const keys = Object.keys(data);
	const totalLanguages = keys.length;
	const languageNames = keys.sort();

	const languageNameResult = generateLanguageNameType({
		languageNames,
		typeName: LANGUAGE_NAME,
		baseType: "string" as const,
		config: { ...config, type: { ...config.type, useReadonlyArrays: false } },
	});

	const existingTypes = new Map<string, GeneratedDefs<string, LanguageName>>([
		[LANGUAGE_NAME, { segmentDefs: languageNameResult.segmentDefs, typeDef: languageNameResult.typeDef }],
	]);

	const existing: Existing = {
		segments: [...languageNameResult.segmentDefs],
		types: existingTypes,
	};

	const fieldsArray = [...fieldStats].sort();
	const existingNames = new Set([LANGUAGE_NAME]);
	const { generatedTypes, allSegmentDefinitions } = processFields({
		fields: fieldsArray,
		totalLanguages,
		existing,
		config,
		existingNames,
	});

	// OUTPUTS
	const output_header = emitAutogenHeader(SOURCE_FILE_NAME, config, {
		size: fieldStats.size,
		total: totalLanguages,
	});
	const output_segments = emitSegmentSection(allSegmentDefinitions);
	const output_lang_name_export = generatedTypes.has(LANGUAGE_NAME)
		? `export type ${LANGUAGE_NAME} = ${generatedTypes.get(LANGUAGE_NAME)?.typeDef};\n`
		: "";
	const output_sorted_types = emitTypesSection(generatedTypes, LANGUAGE_NAME);
	const output_fields = emitLanguageType({ stats: fieldStats, types: generatedTypes, config });
	const output_utility_types = emitUtilityTypes(LANGUAGE_NAME);
	const output_typesafe_accessors = emitTypeSafeAccessors(LANGUAGE_NAME);
	const output_validation_helpers = emitValidationHelpers(LANGUAGE_NAME);

	const output = [
		output_header,
		//
		output_segments,
		output_lang_name_export,
		output_sorted_types,
		output_fields,

		//
		output_utility_types,
		output_typesafe_accessors,
		output_validation_helpers,
	].join("");

	if (config.type.showFieldStats) {
		//

		const stats = emitStats({
			map: fieldStats,
			types: generatedTypes,
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
