import { getUsageName } from "@gen/usage/get-usage-name";
import { createBlockBuilder } from "@utils/create-block-builder";
import { stringify } from "safe-stable-stringify";
import { buildMap } from "@/transform/utils/build-map";
import { normalizeName } from "@/transform/utils/normalize-name";
import { createStatementBuilder } from "@/transform/utils/statement/create-statement-builder";
import { createStatementPaths } from "@/transform/utils/statement/create-statement-paths";

import type { MapEmitterOptions, MapEmitterType } from "./types";

const emitMap: MapEmitterType<MapEmitterOptions> = ({ name, languages, options, config, stats: _stats }) => {
	//

	const stats = new Map(_stats);

	const norm = normalizeName(name);

	const map = buildMap({ source: languages, ...options });

	const obj = Object.fromEntries(map);

	const json = stringify(obj, (_k, v) => (v instanceof Set ? [...v] : v), 2) || "";

	const builder = createStatementBuilder();
	const paths = createStatementPaths(config);

	const [prefixed_stmt, prefixed_stmt_export] = builder
		.var(norm.varName)
		.prefix("_")
		.expr()
		.from()
		.value(json)
		.asConst()
		.build();

	//
	if (options.kind === "set") {
		//

		const field = getUsageName({ left: options.right, right: options.left });

		const type = normalizeName(field).typeName;

		const stat = stats.get(options.right);

		if (!stat || !type) throw new Error("stats or type is null");

		const type_imports_static = builder.import().types(["Dictionary"], []).from(paths.common).build();

		const itype_imports_dynamic = builder.import().types([], [type]).from(paths.usage).build();

		const [stmt, stmt_export] = builder
			.var(norm.varName)
			.prefix("_")
			.typeof()
			.wrap("Dictionary<$>")
			.types([], [type])
			.build();

		const [type_stmt, type_stmt_export] = builder.var(norm.varName).typeof(norm.typeName).build();

		const blocks = createBlockBuilder()
			.import(type_imports_static, "type", "TYPIMP01")
			.import(itype_imports_dynamic, "type", "TYPIMP01")
			.expr(prefixed_stmt, true)
			.expr(stmt)
			.type(type_stmt)
			.exportExpr(prefixed_stmt_export, true)
			.exportExpr(stmt_export)
			.exportType(type_stmt_export);

		return { norm, blocks };
	}

	//
	if (options.kind === "primitive") {
		//

		const _stat = stats.get(options.value);
		if (!_stat) throw new Error("stat is null");

		const { type } = _stat;

		const imports = builder.import().types(["Dictionary"], [type]).from(paths.common).build();

		const [stmt, stmt_export] = builder
			.var(norm.varName)
			.prefix("_")
			.typeof()
			.wrap("Dictionary<$>")
			.types([], [type])
			.build();

		const [type_stmt, type_stmt_export] = builder.var(norm.varName).typeof(norm.typeName).build();

		// const [__meta, __meta_export] = builder
		// 	.var("__meta")
		// 	.record()
		// 	.from()
		// 	.record({
		// 		source: options.key,
		// 		target: options.value,
		// 		kind: options.kind,
		// 	})
		// 	.asConst()
		// 	.build();

		const blocks = createBlockBuilder()
			.import(imports, "type")
			.expr(prefixed_stmt, true)
			.expr(stmt)
			.type(type_stmt)
			.exportExpr(prefixed_stmt_export, true)
			.exportExpr(stmt_export)
			.exportType(type_stmt_export);
		// .meta(__meta)
		// .exportMeta(__meta_export)

		return { norm, blocks };
	}

	//
	if (options.kind === "custom") {
		//

		throw new Error(`no impl yet`);
	}

	const blocks = createBlockBuilder();

	return { norm, blocks };
};

export { emitMap };
