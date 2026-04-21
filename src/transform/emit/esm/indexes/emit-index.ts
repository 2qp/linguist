import { LANG_DICTIONARY } from "@/constants/commons";
import { buildMap } from "@/transform/utils/build-map";
import { normalizeName } from "@/transform/utils/normalize-name";
import { createStatementBuilder } from "@/transform/utils/statement/create-statement-builder";
import { createStatementPaths } from "@/transform/utils/statement/create-statement-paths";

import type { IndexEmitterOptions, IndexEmitterType } from "./types";

const emitIndex: IndexEmitterType<IndexEmitterOptions> = ({ name, languages, options, config }) => {
	//

	// const stats = new Map(_stats);

	const builder = createStatementBuilder();
	const paths = createStatementPaths(config);

	const norm = normalizeName(name);

	if (options.kind === "primitive") {
		//

		const map = buildMap({ source: languages, ...options });

		const statements = [...map].map(([lid, name]) => {
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

		const entries = statements.map((item) => item.obj);
		const valueImports = statements.map((item) => item.valueImports);
		const typeImports = statements.map((item) => item.typeImports);
		const typeObj = statements.map((item) => item.typeObj);

		const externalTypeImports = builder.import().types(LANG_DICTIONARY, []).from(paths.common).build();

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
			.wrap("Dictionary<$>")
			.types(["Language", "undefined"], [])
			.build();

		const content = [
			valueImports.join("\n"),
			typeImports.join("\n"),
			externalTypeImports,

			var_stmt,
			type_stmt,

			var_export_stmt,
			type_export_stmt,
		].join("\n\n");

		return { norm, content };
	}

	if (options.kind === "set") {
		//

		const map = buildMap({ source: languages, ...options });

		const statements = [...map].map(([ext, nameSet]) => {
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

		const entries = statements.map((item) => item.vars);
		const typeEntries = statements.map((item) => item.types);

		const valueImports = [...new Set(statements.flatMap((item) => item.valueImports))];
		const typeImports = [...new Set(statements.flatMap((item) => item.typeImports))];

		//

		const manualTypeImports = builder.import().types(LANG_DICTIONARY, []).from(paths.common).build();

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

		const content = [
			valueImports.join("\n"),
			typeImports.join("\n"),
			manualTypeImports,

			var_stmt,
			type_stmt,

			var_stmt_export,
			type_stmt_export,
		].join("\n\n");

		return { norm, content };
	}

	throw Error("unexpected option.kind");
};

export { emitIndex };
