import { emitLanguageType } from "./emit-language-type";
import { emitTypesSection } from "./emit-types-sections";
import { processFields } from "@gen/utils/process-fields";

import type { Ref } from "@core/create-reference";
import type { Config } from "@/types/config.types";
import type { FieldAnalysisMap } from "@/types/field.types";
import type { LanguageData } from "@/types/lang.types";

type EmitSecondaryTypesParams = {
	stats: FieldAnalysisMap;
	config: Config;
	data: LanguageData | undefined;
	ref: Ref;
	// types: Map<string, GeneratedDefs<string, string>>;
};

type EmitSecondaryTypesType = (params: EmitSecondaryTypesParams) => string[];

const emitSecondaryTypes: EmitSecondaryTypesType = ({ config: rawConfig, stats, data, ref }) => {
	//

	if (!rawConfig.type.secondary.enabled) return [];

	const config: Config = { ...rawConfig, type: { ...rawConfig.type, ...rawConfig.type.secondary } };

	if (!data) throw Error("Unable load yaml data on [emitStrictTypes] x");

	const fieldsArray = [...stats].sort();
	const keys = Object.keys(data);
	const totalLanguages = keys.length;

	const fields = processFields({
		fields: fieldsArray,
		totalLanguages,
		config,
		ref,
	});

	const newStrictFieldStats = new Map(fields.updatedFields);

	const name = `${config.type.naming.secondaryPrefix}${config.type.naming.languageName}`;

	const output_strict_sorted_types = emitTypesSection(fields.generatedTypes, name);

	const output_strict_language_type = emitLanguageType({
		stats: newStrictFieldStats,
		types: fields.generatedTypes,
		config,
		ref,
	});

	const strict = [output_strict_sorted_types, output_strict_language_type];

	return strict;
};

export { emitSecondaryTypes };
export type { EmitSecondaryTypesParams as EmitStrictTypesParams, EmitSecondaryTypesType as EmitStrictTypesType };
