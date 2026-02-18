import { join } from "@utils/join";

import type { UID } from "@/types/branded.types";
import type { Config } from "@/types/config.types";
import type { GeneratedDefs } from "@/types/def.types";
import type { Primitive } from "@/types/gen.types";

type EmitLanguagePropertyTypeNameParams = { types: Map<UID, GeneratedDefs<Primitive, string>>; config: Config };

type EmitLanguagePropertyTypeNameType = (
	params: EmitLanguagePropertyTypeNameParams,
) => `export type LanguagePropertyTypeName = "${string}" | "${string}";\n\n`;

const emitLanguagePropertyTypeName: EmitLanguagePropertyTypeNameType = ({ types, config }) => {
	//

	const existing = [`"${config.type.naming.language}"`] as const;

	const typesAr = types
		.keys()
		.toArray()
		.flatMap(
			(type) =>
				[`"${types.get(type)?.type}"`, `"${config.type.naming.secondaryPrefix}${types.get(type)?.type}"`] as const,
		)
		.concat(existing)
		.sort();

	const seperated = join(typesAr, " | ");

	const exportStatement = `export type LanguagePropertyTypeName = ${seperated};\n\n` as const;

	return exportStatement;
};

export { emitLanguagePropertyTypeName };
export type { EmitLanguagePropertyTypeNameParams, EmitLanguagePropertyTypeNameType };
