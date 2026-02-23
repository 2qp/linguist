import { emitAutogenHeader } from "@/emit/emit-autogen-header";
import { emitLanguagePropertyTypeName } from "@/emit/emit-language-property-type-name";
import { emitLanguageType } from "@/emit/emit-language-type";
import { emitSecondaryTypes } from "@/emit/emit-secondary-types";
import { emitSegmentSection } from "@/emit/emit-segment-section";
import { emitStats } from "@/emit/emit-stats";
import { emitTypesSection } from "@/emit/emit-types-sections";
import { emitTypeSafeAccessors } from "@/emit/emit-typesafe-accessors";
import { emitUtilityTypes } from "@/emit/emit-utility-types";

import type { Generator } from "./types";

type GenerateDynamicTypes = Generator<string>;

const generateDynamicTypes: GenerateDynamicTypes = ({ config, ...params }) => {
	//

	//

	const name = config.type.naming.languageName;

	// OUTPUTS
	const output_header = emitAutogenHeader(config.core.name, config, params.meta);

	const output_segments = emitSegmentSection(params.fields.allSegmentDefinitions);

	const output_sorted_types = emitTypesSection(params.fields.generatedTypes, name);

	const output_language_type = emitLanguageType({ config, ...params });

	const output_utility_types = emitUtilityTypes(name);

	const output_typesafe_accessors = emitTypeSafeAccessors(name);
	// const output_validation_helpers = emitValidationHelpers(LANGUAGE_NAME);

	const secondary = emitSecondaryTypes({ ...params, config });

	const output_typeNames = emitLanguagePropertyTypeName({ ...params, config });

	const output = [
		output_header,
		//
		output_segments,
		output_sorted_types,
		...output_language_type,

		//
		...secondary,

		//
		output_utility_types,
		output_typeNames,
		output_typesafe_accessors,
	].join("");

	if (config.type.showFieldStats) {
		//

		const stats_output = emitStats({ ...params, config });

		return [output, ...stats_output].join("");
	}

	return output;
};

export { generateDynamicTypes };
export type { GenerateDynamicTypes };
