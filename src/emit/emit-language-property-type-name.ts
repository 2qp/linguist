import { join } from "@utils/join";

import type { GeneratedDefs } from "@/types/def.types";

type EmitLanguagePropertyTypeNameParams = { types: Map<string, GeneratedDefs<string, string>> };

type EmitLanguagePropertyTypeNameType = (
	params: EmitLanguagePropertyTypeNameParams,
) => `export type LanguagePropertyTypeName = "${string}" | "${string}";\n\n`;

const emitLanguagePropertyTypeName: EmitLanguagePropertyTypeNameType = ({ types }) => {
	//

	const typesAr = types
		.keys()
		.toArray()
		.map((type) => `"${type}"` as const);

	const seperated = join(typesAr, " | ");

	const exportStatement = `export type LanguagePropertyTypeName = ${seperated};\n\n` as const;

	return exportStatement;
};

export { emitLanguagePropertyTypeName };
export type { EmitLanguagePropertyTypeNameParams, EmitLanguagePropertyTypeNameType };
