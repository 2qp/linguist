import { createBlockBuilder } from "@utils/create-block-builder";
import { LANG_DICTIONARY } from "@/constants/commons";
import { buildMap } from "@/transform/utils/build-map";
import { normalizeName } from "@/transform/utils/normalize-name";
import { createStatementBuilder } from "@/transform/utils/statement/create-statement-builder";
import { createStatementPaths } from "@/transform/utils/statement/create-statement-paths";

import type { IndexEmitterOptions, IndexEmitterType } from "./types";

const emitDynamicIndex: IndexEmitterType<IndexEmitterOptions> = ({
	name,
	languages,
	options,
	config,
	stats: _stats,
}) => {
	//

	const stats = new Map(_stats);

	const builder = createStatementBuilder();

	const _norm = normalizeName(name);

	const str = config.data.paths.typesDir.replace(/\/+$/, "");
	const last = str.lastIndexOf("/");
	const secondLast = str.lastIndexOf("/", last - 1);
	const typesDir = last === -1 ? str : secondLast === -1 ? str : str.slice(secondLast + 1);

	if (options.kind === "primitive") {
		//

		const map = buildMap({ source: languages, ...options });

		const stat = stats.get(options.key);

		const struct = `readonly [string, string]` as const;

		const statements = [...map].map(([lid, name]) => {
			//

			const norm = normalizeName(name);

			const langData = languages[name];
			const type = langData.type;

			/**
			 * `perFile: true` config affect the `dynamicPath`.
			 *
			 * enables `tsup` to chunkup. which places the getters on `/dist` rather than `/dist/getters/`.
			 *
			 * see [config]{@link (../../../transform.ts)}
			 */
			const dynamicPath = builder.common().path().from("./", typesDir, "/", type, "/", norm.fileName).build();

			const typeImports = builder
				.import()
				.types([], [norm.typeName])
				.from<string[]>(config.data.paths.typesDir, "/", type, "/", norm.fileName)
				.build();

			const types = builder
				.common()
				.record()
				.key(lid)
				.wrap("OptionalBrand<$>")
				.values([struct, `"[${norm.typeName}]"`])
				.build();

			const vars = builder
				.common()
				.record()
				.key(lid)
				.wrap("[$]")
				.values([dynamicPath, `"${norm.varName}"`])
				.build();

			return { types, vars, typeImports };
		});

		const vars = statements.map((item) => item.vars);
		const types = statements.map((item) => item.types);
		const typeImports = statements.map((item) => item.typeImports);

		const obj = `dynamic By ${stat?.type}` as const;
		const norm = normalizeName(obj);
		const paths = createStatementPaths(config);

		const externalTypeImports = builder
			.import()
			.types([...LANG_DICTIONARY, "OptionalBrand"], [])
			.from(paths.common)
			.build();

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
			.wrap("Dictionary<OptionalBrand<$>>")
			.types([], [`${struct}, [Language]`, "undefined"])
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

		const stat = stats.get(options.left);

		const struct = `readonly string[]` as const;

		const statements = [...map].map(([ext, nameSet]) => {
			//

			const processed = [...nameSet].map((name) => {
				//

				const language = languages[name];
				const type = language.type;

				const { varName, typeName, ...norm } = normalizeName(name);

				const dynamicPath = builder.common().path().from("./", typesDir, "/", type, "/", norm.fileName).build();

				const typeImports = builder
					.import()
					.types([], [typeName])
					.from<string[]>(config.data.paths.typesDir, "/", type, "/", norm.fileName)
					.build();

				return { typeName, dynamicPath, typeImports, varName };
			});

			const typeNames = processed.map((item) => item.typeName);
			const paths_ = processed.map((item) => `${item.dynamicPath}, "${item.varName}"` as const);
			const typeImports = processed.map((item) => item.typeImports);

			const types = builder
				.common()
				.record()
				.key(ext)
				.wrap("OptionalBrand<$>")
				.values([struct, `[${typeNames.join(", ")}]`])
				.build();

			const vars = builder.common().record().key(ext).wrap("[$]").values(paths_).build();

			return { vars, types, typeImports };

			//
		});

		const vars = statements.map((item) => item.vars);
		const types = statements.map((item) => item.types);
		const typeImports = [...new Set(statements.flatMap((item) => item.typeImports))];

		const obj = `dynamic By ${stat?.type}` as const;

		const norm = normalizeName(obj);
		const paths = createStatementPaths(config);

		const externalTypeImports = builder
			.import()
			.types([...LANG_DICTIONARY, "OptionalBrand"], [])
			.from(paths.common)
			.build();

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
			.wrap("Dictionary<OptionalBrand<$>>")
			.types([], [`${struct}, Language[]`, "undefined"])
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

export { emitDynamicIndex };
