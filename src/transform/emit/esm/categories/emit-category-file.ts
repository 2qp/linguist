import { LANG_DICTIONARY } from "@/constants/commons";
import { buildMap } from "@/transform/utils/build-map";
import { normalizeName } from "@/transform/utils/normalize-name";
import { createStatementBuilder } from "@/transform/utils/statement/create-statement-builder";
import { createStatementPaths } from "@/transform/utils/statement/create-statement-paths";

import type { Config } from "@/types/config.types";
import type { Languages } from "@/types/generated.types";

type EmitCategoryFileParams = {
	languages: Languages;
	config: Config;
	category: string;
};

type EmitCategoryFileType = (params: EmitCategoryFileParams) => string;

const emitCategoryFile: EmitCategoryFileType = ({ config, languages, category }) => {
	//

	if (!languages) return "";

	const map = buildMap({ source: languages, kind: "primitive", key: "language_id", value: "name" });

	const builder = createStatementBuilder();

	const result = [...map].map(([lid, name]) => {
		//

		const language = languages[name];
		if (!language) throw new Error(`language ${name} is missing`);

		const type = language.type;

		const norm = normalizeName(name);

		const vars = builder.common().record().key(lid).value(norm.varName).build();
		const types = builder.common().record().key(lid).value(norm.typeName).build();

		const valueImports = builder
			.import()
			.values([norm.varName])
			.from(config.data.paths.typesDir, "/", type, "/", norm.fileName)
			.build();

		const typeImports = builder
			.import()
			.types([], [norm.typeName])
			.from(config.data.paths.typesDir, "/", type, "/", norm.fileName)
			.build();

		return { vars, types, valueImports, typeImports };
	});

	const vars = result.map((item) => item.vars);
	const types = result.map((item) => item.types);
	const valueImports = result.map((item) => item.valueImports);
	const typeImports = result.map((item) => item.typeImports);

	const paths = createStatementPaths(config);

	const externalTypeImports = builder.import().types(LANG_DICTIONARY, []).from(paths.common).build();

	const norm = normalizeName(category);

	const [var_stmt, var_export_stmt] = builder
		.var(norm.varName)
		.record()
		.from()
		.tuple(vars)
		.asConst()
		.type(norm.typeName)
		.build();

	const [type_stmt, type_export_stmt] = builder
		.type()
		.alias(norm.typeName)
		.exp()
		.from()
		.tuple(types)
		.wrap("FallbackForUnknownKeys<$>")
		.types(["Language", "undefined"], [])
		.build();

	return [
		valueImports.join("\n"),
		typeImports.join("\n"),
		externalTypeImports,

		var_stmt,
		type_stmt,

		var_export_stmt,
		type_export_stmt,
	].join("\n\n");
};

export { emitCategoryFile };
export type { EmitCategoryFileParams, EmitCategoryFileType };
