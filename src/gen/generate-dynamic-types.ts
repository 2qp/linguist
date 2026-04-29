import { join } from "node:path";
import { emitAutogenHeader } from "@/emit/emit-autogen-header";
import { emitLanguagePropertyTypeName } from "@/emit/emit-language-property-type-name";
import { emitLanguageType } from "@/emit/emit-language-type";
import { emitSecondaryTypes } from "@/emit/emit-secondary-types";
import { emitSegmentSection } from "@/emit/emit-segment-section";
import { emitStats } from "@/emit/emit-stats";
import { emitTypesSection } from "@/emit/emit-types-sections";
import { emitTypeSafeAccessors } from "@/emit/emit-typesafe-accessors";
import { emitUtilityTypes } from "@/emit/emit-utility-types";
import { createStatementBuilder } from "@/transform/utils/statement/create-statement-builder";

import type { Generator } from "./types";

type GenerateDynamicTypes = Generator<Promise<string>>;

const generateDynamicTypes: GenerateDynamicTypes = async ({ config, ...params }) => {
	//

	//

	const name = config.type.naming.languageName;

	// OUTPUTS
	const output_header = emitAutogenHeader(config.core.name, config, params.meta);

	const output_segments = emitSegmentSection(params.fields.allSegmentDefinitions);

	const output_sorted_types = emitTypesSection(params.fields.generatedTypes, name);

	const output_language_type = emitLanguageType({ config, ...params });

	const output_utility_types = await emitUtilityTypes(name);

	const output_typesafe_accessors = emitTypeSafeAccessors(name);
	// const output_validation_helpers = emitValidationHelpers(LANGUAGE_NAME);

	const secondary = emitSecondaryTypes({ ...params, config });

	const output_typeNames = emitLanguagePropertyTypeName({ ...params, config });

	const builder = createStatementBuilder();

	const brandedSourcePaths = config.type.source_paths.types.branded;
	const brandedFile = join(brandedSourcePaths.dir.alias, brandedSourcePaths.file.name);

	const types = builder.export().types(["OptionalBrand"], []).from(brandedFile).re_export().build();

	const output = [
		output_header,
		"\n\n",
		types,
		"\n\n",
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
