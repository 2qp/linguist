import { stringify } from "safe-stable-stringify";
import { createStatementBuilder } from "@/transform/utils/statement/create-statement-builder";

import type { NormalizedName } from "@/transform/utils/normalize-name";
import type { Language } from "@/types/generated.types";

type EmitLanguageFileParams = { norm: NormalizedName; data: Language | undefined };

type EmitLanguageFileType = (params: EmitLanguageFileParams) => string;

const emitLanguageFile: EmitLanguageFileType = ({ norm, data }) => {
	//
	const jsonStr = stringify(data, null, 2);

	if (!jsonStr) throw new Error(`obj ${norm.name} is missing`);

	const builder = createStatementBuilder().var(norm.varName);

	const [var_stmt, var_export_stmt] = builder.value(jsonStr).asConst().build();

	const [type_stmt, type_export_stmt] = builder.typeof(norm.typeName).build();

	return [
		var_stmt,
		type_stmt,

		var_export_stmt,
		type_export_stmt,
	].join("\n\n");
};

export { emitLanguageFile };
export type { EmitLanguageFileParams, EmitLanguageFileType };
