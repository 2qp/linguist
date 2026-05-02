import { createBlockBuilder } from "@utils/create-block-builder";
import { LANG_DICTIONARY } from "@/constants/commons";
import { buildMap } from "@/transform/utils/build-map";
import { normalizeName } from "@/transform/utils/normalize-name";
import { createStatementBuilder } from "@/transform/utils/statement/create-statement-builder";
import { createStatementPaths } from "@/transform/utils/statement/create-statement-paths";

import type { IndexEmitterOptions, IndexEmitterType } from "./types";

const emitLazyIndex: IndexEmitterType<IndexEmitterOptions> = ({ name, languages, options, config }) => {
	//

	const builder = createStatementBuilder();

	const _norm = normalizeName(name);

	if (options.kind === "primitive") {
		//

		const map = buildMap({ source: languages, ...options });

		const field = options.key;

		const statements = [...map].map(([lid, name]) => {
			//

			const norm = normalizeName(name);

			const langData = languages[name];
			const type = langData.type;

			const lazyValue = builder
				.import()
				.lazy()
				.values()
				.from<string[]>([config.data.paths.typesDir, "/", type, "/", norm.fileName]) // explicit to prevent ts inference slowdown
				.then_(norm.varName)
				.build();

			const typeImports = builder
				.import()
				.types([], [norm.typeName])
				.from<string[]>(config.data.paths.typesDir, "/", type, "/", norm.fileName)
				.build();

			const types = builder.common().record().key(lid).wrap("() => Promise<$>").value(norm.typeName).build();
			const vars = builder.common().record().key(lid).wrap("() => $").value(lazyValue).build();

			return { types, vars, typeImports };
		});

		const vars = statements.map((item) => item.vars);
		const types = statements.map((item) => item.types);
		const typeImports = statements.map((item) => item.typeImports);

		const obj = `lazy By ${field}` as const;

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
			.wrap("Dictionary<() => Promise<$>>")
			.types(["Language", "undefined"], [])
			.build();

		const blocks = createBlockBuilder()
			.import(typeImports.join("\n"), "type")
			.import(externalTypeImports, "type")
			.expr(var_stmt)
			.type(type_stmt)
			.exportExpr(var_export_stmt)
			.exportType(type_export_stmt);

		return { norm: _norm, blocks };
	}

	if (options.kind === "set") {
		//

		const map = buildMap({ source: languages, ...options });

		const field = options.left;

		const statements = [...map].map(([ext, nameSet]) => {
			//

			const processed = [...nameSet].map((name) => {
				//

				const language = languages[name];
				const type = language.type;

				const { varName, typeName, ...norm } = normalizeName(name);

				const valueImports = builder
					.import()
					.lazy()
					.values()
					.from<string[]>([config.data.paths.typesDir, "/", type, "/", norm.fileName]) // explicit to prevent ts inference slowdown
					.then_(varName)
					.build();

				const typeImports = builder
					.import()
					.types([], [typeName])
					.from<string[]>(config.data.paths.typesDir, "/", type, "/", norm.fileName)
					.build();

				return { typeName, valueImports, typeImports };
			});

			const typeNames = processed.map((item) => item.typeName);
			const valueImports_ = processed.map((item) => item.valueImports);
			const typeImports = processed.map((item) => item.typeImports);

			const types = builder.common().record().key(ext).wrap("() => Promise<[$]>").values(typeNames).build();

			const vars = builder.common().record().key(ext).wrap("() => Promise.all([ $ ])").values(valueImports_).build();

			return { vars, types, typeImports };

			//
		});

		const vars = statements.map((item) => item.vars);
		const types = statements.map((item) => item.types);
		const typeImports = [...new Set(statements.flatMap((item) => item.typeImports))];

		const obj = `lazy By ${field}` as const;

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
			.wrap("Dictionary<() => Promise<$>>")
			.types(["Language[]", "undefined"], [])
			.build();

		const blocks = createBlockBuilder()
			.import(typeImports.join("\n"), "type")
			.import(externalTypeImports, "type")
			.expr(var_stmt)
			.type(type_stmt)
			.exportExpr(var_export_stmt)
			.exportType(type_export_stmt);

		return { norm: _norm, blocks };
	}

	throw Error("unexpected option.kind");
};

export { emitLazyIndex };
