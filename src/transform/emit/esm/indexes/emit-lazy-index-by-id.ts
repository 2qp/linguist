import { LANG_DICTIONARY } from "@/constants/commons";
import { buildMap } from "@/transform/utils/build-map";
import { normalizeName } from "@/transform/utils/normalize-name";
import { createStatementBuilder } from "@/transform/utils/statement/create-statement-builder";
import { createStatementPaths } from "@/transform/utils/statement/create-statement-paths";

import type { IndexEmitterType } from "./types";

const emitLazyIndexById: IndexEmitterType = ({ languages, config }): string => {
	//

	const map = buildMap({ kind: "primitive", source: languages, key: "language_id", value: "name" });

	const builder = createStatementBuilder();

	const output = [...map].map(([lid, name]) => {
		//

		const norm = normalizeName(name);

		const langData = languages[name];
		const type = langData.type;

		const lazyValue = builder
			.import()
			.lazy()
			.values()
			.from([config.data.paths.typesDir, "/", type, "/", norm.fileName])
			.then_(norm.varName)
			.build();

		const typeImports = builder
			.import()
			.types([], [norm.typeName])
			.from(config.data.paths.typesDir, "/", type, "/", norm.fileName)
			.build();

		const types = builder.common().record().key(lid).wrap("() => Promise<$>").value(norm.typeName).build();
		const vars = builder.common().record().key(lid).wrap("() => $").value(lazyValue).build();

		return { types, vars, typeImports };
	});

	const vars = output.map((item) => item.vars);
	const types = output.map((item) => item.types);
	const typeImports = output.map((item) => item.typeImports);

	const obj = "lazy By Id" as const;
	const norm = normalizeName(obj);
	const paths = createStatementPaths(config);

	const externalTypeImports = builder.import().types(LANG_DICTIONARY, []).from(paths.common).build();

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
		.wrap("FallbackForUnknownKeys<() => Promise<$>>")
		.types(["Language", "undefined"], [])
		.build();

	// later with ts compiler api
	return [
		typeImports.join("\n"),
		externalTypeImports,

		var_stmt,
		type_stmt,

		var_export_stmt,
		type_export_stmt,
	].join("\n\n");
};

export { emitLazyIndexById };
