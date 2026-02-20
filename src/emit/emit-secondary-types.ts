import { emitLanguageType } from "./emit-language-type";
import { emitTypesSection } from "./emit-types-sections";
import { processFields } from "@gen/utils/process-fields";

import type { Meta } from "@core/create-meta";
import type { Ref } from "@core/create-reference";
import type { Field } from "@/types/branded.types";
import type { Config } from "@/types/config.types";
import type { FieldAnalysisArray } from "@/types/field.types";
import type { Primitive } from "@/types/gen.types";
import type { LanguageData } from "@/types/lang.types";

type EmitSecondaryTypesParams<TField extends string = Field, TUnique extends Primitive = Primitive> = {
	stats: FieldAnalysisArray<TField, TUnique>;
	config: Config;
	source: LanguageData;
	ref: Ref;
	meta: Meta;
	// types: Map<string, GeneratedDefs<string, string>>;
};

type EmitSecondaryTypesType = (params: EmitSecondaryTypesParams) => string[];

const emitSecondaryTypes: EmitSecondaryTypesType = ({ config: rawConfig, stats, ref, meta }) => {
	//

	if (!rawConfig.type.secondary.enabled) return [];

	const config: Config = { ...rawConfig, type: { ...rawConfig.type, ...rawConfig.type.secondary } };

	const fields = processFields({
		fields: stats,
		config,
		meta,
		ref,
	});

	const name = `${config.type.naming.secondaryPrefix}${config.type.naming.languageName}`;

	const output_strict_sorted_types = emitTypesSection(fields.generatedTypes, name);

	const output_strict_language_type = emitLanguageType({
		stats: fields.updatedFields,
		types: fields.generatedTypes,
		config,
		ref,
	});

	const strict = [output_strict_sorted_types, output_strict_language_type];

	return strict;
};

export { emitSecondaryTypes };
export type { EmitSecondaryTypesParams as EmitStrictTypesParams, EmitSecondaryTypesType as EmitStrictTypesType };
