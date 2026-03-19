import { buildMap } from "@/transform/utils/build-map";
import { normalizeName } from "@/transform/utils/normalize-name";
import { createStatementBuilder } from "@/transform/utils/statement/create-statement-builder";
import { createStatementPaths } from "@/transform/utils/statement/create-statement-paths";

import type { IndexEmitterType } from "./types";

const emitIndexById: IndexEmitterType = ({ languages, config }): string => {
	//

	const map = buildMap({ kind: "primitive", source: languages, key: "language_id", value: "name" });

	const builder = createStatementBuilder();

	const output = [...map].map(([lid, name]) => {
		//

		const norm = normalizeName(name);

		const langData = languages[name];
		const type = langData.type;

		const obj = builder.common().record().key(lid).value(norm.varName).build();
		const typeObj = builder.common().record().key(lid).value(norm.typeName).build();

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

		return { obj, typeObj, valueImports, typeImports };
	});

	const entries = output.map((item) => item.obj);
	const valueImports = output.map((item) => item.valueImports);
	const typeImports = output.map((item) => item.typeImports);
	const typeObj = output.map((item) => item.typeObj);

	const paths = createStatementPaths(config);

	const externalTypeImports = builder
		.import()
		.types(["Language", "FallbackForUnknownKeys"], [])
		.from(paths.common)
		.build();

	const obj = "by Id" as const;

	const norm = normalizeName(obj);

	const [var_stmt, var_export_stmt] = builder
		.var(norm.varName)
		.record()
		.from()
		.tuple(entries)
		.asConst()
		.type(norm.typeName)
		.build();

	const [type_stmt, type_export_stmt] = builder
		.type()
		.alias(norm.typeName)
		.exp()
		.from()
		.tuple(typeObj)
		.wrap("FallbackForUnknownKeys<$>")
		.types(["Language", "undefined"], [])
		.build();

	// later with ts compiler api
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

export { emitIndexById };
