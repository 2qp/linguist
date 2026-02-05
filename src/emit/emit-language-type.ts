import { generateFieldType } from "@gen/generate-field-type";
import { replacer } from "@utils/replacer";

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

			if (!stats.typeName) {
				const typeName = tName.toLowerCase() === field.toLowerCase().replace(/_/g, "") ? tName : undefined;
				return typeName;
			}

			if (config.type.strict) {
				//

				const regex = new RegExp(config.type.naming.strictPrefix, "gi");

				const replaced = replacer(tName, regex, "").toLowerCase();

				const typeName = replaced === stats.typeName.toLowerCase() ? tName : undefined;

				return typeName;
			}

			const typeName = tName.toLowerCase() === stats.typeName.toLowerCase() ? tName : undefined;
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

	if (config.type.strict) {
		//

		const name = `${config.type.naming.strictPrefix}${config.type.naming.language}`;

		const start = `\nexport type ${name} = {\n`;
		const end = `}\n\n` as const;

		return [start, ...fields, end].join("");
	}

	const name = config.type.naming.language;

	const start = `\nexport type ${name} = {\n`;
	const end = `}\n\n` as const;

	return [start, ...fields, end].join("");
};

export { emitLanguageType };
export type { EmitLanguageTypeParams, EmitLanguageTypeType };
