import { createSecondaryName } from "@gen/utils/misc/create-secondary-name";
import { join } from "@utils/join";

import type { Emitter } from "./types";

type EmitLanguagePropertyTypeName = Emitter<`export type LanguagePropertyTypeName = "${string}" | "${string}";\n\n`>;

const emitLanguagePropertyTypeName: EmitLanguagePropertyTypeName = ({ config, fields }) => {
	//

	const types = fields.generatedTypes;

	const existing = [`"${config.type.naming.language}"`] as const;

	const typesAr = [...types.keys()]
		.flatMap(
			(type) =>
				[`"${types.get(type)?.type}"`, `"${createSecondaryName({ name: types.get(type)?.type, config })}"`] as const,
		)
		.concat(existing)
		.sort();

	const seperated = join(typesAr, " | ");

	const exportStatement = `export type LanguagePropertyTypeName = ${seperated};\n\n` as const;

	return exportStatement;
};

export { emitLanguagePropertyTypeName };
export type { EmitLanguagePropertyTypeName };
