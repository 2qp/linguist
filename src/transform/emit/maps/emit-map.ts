import { getUsageName } from "@gen/usage/get-usage-name";
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

	const [prefixed_stmt, prefixed_stmt_export] = builder.var(norm.varName).prefix("_").value(json).asConst().build();

	//
	if (options.kind === "set") {
		//

		const field = getUsageName({ left: options.right, right: options.left });

		const type = normalizeName(field).typeName;

		const stat = stats.get(options.right);

		//

		if (!stat || !type) throw new Error("stats or type is null");

		const imports = builder.import().types(["FallbackForUnknownKeys"], []).from(paths.common).build();

		const imports_usage = builder.import().types([], [type]).from(paths.usage).build();

		const [stmt, stmt_export] = builder
			.var(norm.varName)
			.prefix("_")
			.typeof()
			// .wrap(stat.isArray ? "FallbackForUnknownKeys<$>" : "$[number]")
			.wrap("FallbackForUnknownKeys<$>")
			.types([], [type])
			.build();

		const [type_stmt, type_stmt_export] = builder.var(norm.varName).typeof(norm.typeName).build();

		const content = [
			[imports, imports_usage].join("\n"),
			prefixed_stmt,
			stmt,
			type_stmt,
			prefixed_stmt_export,
			stmt_export,
			type_stmt_export,
		].join("\n\n");

		return { content, norm };
	}

	//
	if (options.kind === "primitive") {
		//

		const _stat = stats.get(options.value);
		if (!_stat) throw new Error("stat is null");

		const { type } = _stat;

		const imports = builder.import().types(["FallbackForUnknownKeys"], [type]).from(paths.common).build();

		const [stmt, stmt_export] = builder
			.var(norm.varName)
			.prefix("_")
			.typeof()
			.wrap("FallbackForUnknownKeys<$>")
			.types([], [type])
			.build();

		const [type_stmt, type_stmt_export] = builder.var(norm.varName).typeof(norm.typeName).build();

		const content = [imports, prefixed_stmt, stmt, type_stmt, prefixed_stmt_export, stmt_export, type_stmt_export].join(
			"\n\n",
		);

		return { content, norm };
	}

	//
	if (options.kind === "custom") {
		//

		throw new Error(`no impl yet`);
	}

	return { content: "", norm };
};

export { emitMap };
