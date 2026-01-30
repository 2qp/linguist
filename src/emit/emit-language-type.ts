import { generateFieldType } from "@gen/generate-field-type";
import { getMappedFieldOrType } from "@gen/utils/get-mapped-field-or-type";
import { FIELD_TYPE_MAPPING } from "@/constants/field-type-mapping";

import type { Config } from "@/types/config.types";
import type { GeneratedDefs } from "@/types/def.types";
import type { FieldAnalysisMap } from "@/types/field.types";

type EmitLanguageTypeParams = {
	stats: FieldAnalysisMap;
	types: Map<string, GeneratedDefs<string, string>>;
	config: Config;
};

type EmitLanguageTypeType = (params: EmitLanguageTypeParams) => string;

const emitLanguageType: EmitLanguageTypeType = ({ stats, types, config }) => {
	const fields = [...stats].flatMap(([field, stats]) => {
		//

		const typeNames = [...types].map(([tName, _]) => {
			//

			const remappedField = getMappedFieldOrType({
				value: field,
				from: "field",
				to: "type",
				remapper: FIELD_TYPE_MAPPING,
			});

			const typeName = tName.toLowerCase() === remappedField.value.toLowerCase().replace(/_/g, "") ? tName : undefined;

			return typeName;
		});

		const result = typeNames
			.filter((i) => i !== undefined)
			.map((name) => {
				const typeDef = name ? name : generateFieldType({ field, stats, config }).typeDef;

				const optional = stats.isOptional ? "?" : "";

				return `  ${field}${optional}: ${typeDef};\n`;
			});

		return result;
	});

	// console.log(stats, "STATS");
	// console.log(types, "TYPES ");

	const start = `\nexport type Language = {\n`;
	const end = `}\n\n` as const;

	return [start, ...fields, end].join("");
};

export { emitLanguageType };
export type { EmitLanguageTypeParams, EmitLanguageTypeType };
