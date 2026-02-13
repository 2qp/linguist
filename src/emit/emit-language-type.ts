import { generateFieldType } from "@gen/generate-field-type";

import type { Ref } from "@core/create-reference";
import type { Config } from "@/types/config.types";
import type { GeneratedDefs } from "@/types/def.types";
import type { FieldAnalysisMap } from "@/types/field.types";

type EmitLanguageTypeParams = {
	stats: FieldAnalysisMap;
	types: Map<string, GeneratedDefs<string, string>>;
	config: Config;
	ref: Ref;
};

type EmitLanguageTypeType = (params: EmitLanguageTypeParams) => string;

const emitLanguageType: EmitLanguageTypeType = ({ stats, types, config }) => {
	const fields = [...stats].flatMap(([field, stats]) => {
		//

		const typeNames = [...types].map(([segUid, def]) => {
			//

			const uid = stats.uid;

			if (uid !== segUid) return undefined;

			return def.type;
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

	if (config.type.secondary.enabled) {
		//

		const name = `${config.type.naming.secondaryPrefix}${config.type.naming.language}`;

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
