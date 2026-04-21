import { LANG_DICTIONARY } from "@/constants/commons";
import { buildMap } from "@/transform/utils/build-map";
import { normalizeName } from "@/transform/utils/normalize-name";
import { createStatementBuilder } from "@/transform/utils/statement/create-statement-builder";
import { createStatementPaths } from "@/transform/utils/statement/create-statement-paths";

import type { IndexEmitterType } from "./types";

/**
 * @deprecated
 */
// @ts-expect-error
const emitIndexByExtension: IndexEmitterType = ({ languages, config }): string => {
	//

	const map = buildMap({ kind: "set", source: languages, left: "extensions", right: "name" });
	const builder = createStatementBuilder();

	const result = [...map].map(([ext, nameSet]) => {
		//

		const processed = [...nameSet].map((name) => {
			const { varName, typeName, ...norm } = normalizeName(name);

			const language = languages[name];
			const type = language.type;

			const valueImports = builder
				.import()
				.values([varName])
				.from(config.data.paths.typesDir, "/", type, "/", norm.fileName)
				.build();

			const typeImports = builder
				.import()
				.types([], [typeName])
				.from(config.data.paths.typesDir, "/", type, "/", norm.fileName)
				.build();

			return { varName, typeName, valueImports, typeImports };
		});

		const varNames = processed.map((item) => item.varName);
		const typeNames = processed.map((item) => item.typeName);
		const valueImports = processed.map((item) => item.valueImports);
		const typeImports = processed.map((item) => item.typeImports);

		const vars = builder.common().record().key(ext).wrap("[$]").values(varNames).build();
		const types = builder.common().record().key(ext).wrap("[$]").values(typeNames).build();

		return { vars, types, valueImports, typeImports };

		//
	});

	const entries = result.map((item) => item.vars);
	const typeEntries = result.map((item) => item.types);

	const valueImports = [...new Set(result.flatMap((item) => item.valueImports))];
	const typeImports = [...new Set(result.flatMap((item) => item.typeImports))];

	const paths = createStatementPaths(config);

	const manualTypeImports = builder.import().types(LANG_DICTIONARY, []).from(paths.common).build();

	const obj = "by Extension" as const;
	const norm = normalizeName(obj);

	const [var_stmt, var_stmt_export] = builder
		.var(norm.varName)
		.record()
		.from()
		.tuple(entries)
		.asConst()
		.type(norm.typeName)
		.build();

	const [type_stmt, type_stmt_export] = builder
		.type()
		.alias(norm.typeName)
		.exp()
		.from()
		.tuple(typeEntries)
		.wrap("Dictionary<$>")
		.types(["Language[]", "undefined"], [])
		.build();

	return [
		valueImports.join("\n"),
		typeImports.join("\n"),
		manualTypeImports,

		var_stmt,
		type_stmt,

		var_stmt_export,
		type_stmt_export,
	].join("\n\n");
};

export { emitIndexByExtension };
