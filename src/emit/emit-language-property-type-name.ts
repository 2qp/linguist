import { join } from "@utils/join";

import type { Config } from "@/types/config.types";
import type { GeneratedDefs } from "@/types/def.types";

type EmitLanguagePropertyTypeNameParams = { types: Map<string, GeneratedDefs<string, string>>; config: Config };

type EmitLanguagePropertyTypeNameType = (
	params: EmitLanguagePropertyTypeNameParams,
) => `export type LanguagePropertyTypeName = "${string}" | "${string}";\n\n`;

const emitLanguagePropertyTypeName: EmitLanguagePropertyTypeNameType = ({ types, config }) => {
	//

	const typesAr = types
		.keys()
		.toArray()
		.concat(config.type.naming.language)
		.map((type) => `"${type}"` as const);

	const seperated = join(typesAr, " | ");

	const exportStatement = `export type LanguagePropertyTypeName = ${seperated};\n\n` as const;

	return exportStatement;
};

export { emitLanguagePropertyTypeName };
export type { EmitLanguagePropertyTypeNameParams, EmitLanguagePropertyTypeNameType };
