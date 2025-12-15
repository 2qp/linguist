import { generateFieldType } from "@gen/generate-field-type";

import type { GeneratedDefs } from "@/types/def.types";
import type { FieldAnalysisMap } from "@/types/field.types";
import type { TypeGenConfig } from "@/types/gen-config.types";

const emitLanguageType = (
	map: FieldAnalysisMap,
	types: Map<string, GeneratedDefs<string, string>>,
	config: TypeGenConfig,
) => {
	const fields = [...map].flatMap(([field, stats]) => {
		//

		const typeNames = [...types].map(([tName, _]) => {
			const typeName = tName.toLowerCase() === field.toLowerCase().replace(/_/g, "") ? tName : undefined;

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

	const start = `\nexport type Language = {\n`;
	const end = `}\n\n` as const;

	return [start, ...fields, end].join("");
};

export { emitLanguageType };
