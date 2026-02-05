import { emitLanguageType } from "./emit-language-type";
import { emitTypesSection } from "./emit-types-sections";
import { processFields } from "@gen/utils/process-fields";

import type { Config } from "@/types/config.types";
import type { FieldAnalysisMap } from "@/types/field.types";
import type { LanguageData } from "@/types/lang.types";

type EmitStrictTypesParams = {
	stats: FieldAnalysisMap;
	config: Config;
	data: LanguageData | undefined;
	// types: Map<string, GeneratedDefs<string, string>>;
};

type EmitStrictTypesType = (params: EmitStrictTypesParams) => string[];

const emitStrictTypes: EmitStrictTypesType = ({ config: rawConfig, stats, data }) => {
	//

	const config = { ...rawConfig, type: { ...rawConfig.type, allowFlexibleTypes: false } };

	if (!data) throw Error("Unable load yaml data on [emitStrictTypes] x");

	const fieldsArray = [...stats].sort();
	const keys = Object.keys(data);
	const totalLanguages = keys.length;

	const fields = processFields({
		fields: fieldsArray,
		totalLanguages,
		existing: { segments: [], types: new Map() },
		config,
		existingNames: new Set([]),
	});

	const newStrictFieldStats = new Map(fields.updatedFields);

	const name = `${config.type.naming.strictPrefix}${config.type.naming.languageName}`;

	const output_strict_language_name_type = fields.generatedTypes.has(name)
		? `export type ${name} = ${fields.generatedTypes.get(name)?.typeDef};\n`
		: "";

	const output_strict_sorted_types = emitTypesSection(fields.generatedTypes, name);

	const output_strict_language_type = emitLanguageType({
		stats: newStrictFieldStats,
		types: fields.generatedTypes,
		config,
	});

	const strict = config.type.strict
		? [
				output_strict_language_name_type,

				output_strict_sorted_types,

				output_strict_language_type,
			]
		: [];

	return strict;
};

export { emitStrictTypes };
export type { EmitStrictTypesParams, EmitStrictTypesType };
