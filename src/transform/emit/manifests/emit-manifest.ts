import { getUsageName } from "@gen/usage/get-usage-name";
import { stringify } from "safe-stable-stringify";
import { buildMap } from "@/transform/utils/build-map";
import { normalizeName } from "@/transform/utils/normalize-name";
import { createStatementBuilder } from "@/transform/utils/statement/create-statement-builder";
import { createStatementPaths } from "@/transform/utils/statement/create-statement-paths";

import type { Language } from "@/types/generated.types";
import type { KeyOf } from "@/types/utility.types";
import type { ManifestEmitterOptions, ManifestEmitterType } from "./types";

const emitManifest: ManifestEmitterType<ManifestEmitterOptions> = ({
	name,
	languages,
	options,
	config,
	stats: _stats,
}) => {
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

		//

		if (!stat || !type) throw new Error("stats or type is null");

		const imports = builder.import().types(["Dictionary"], []).from(paths.common).build();

		const imports_usage = builder.import().types([], [type]).from(paths.usage).build();

		const [stmt, stmt_export] = builder
			.var(norm.varName)
			.prefix("_")
			.typeof()
			// .wrap(stat.isArray ? "FallbackForUnknownKeys<$>" : "$[number]")
			.wrap("Dictionary<$>")
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

		const imports = builder.import().types(["Dictionary"], [type]).from(paths.common).build();

		const [stmt, stmt_export] = builder
			.var(norm.varName)
			.prefix("_")
			.typeof()
			.wrap("Dictionary<$>")
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

		const builder = createStatementBuilder();
		const paths = createStatementPaths(config);

		const var_builder = builder.var(norm.varName).prefix("_");

		// could use .common().tuple().key(item)
		const types = options.properties
			.map((item) => [item, stats.get(item)?.type, stats.get(item)?.isOptional] as const)
			.filter((i): i is [KeyOf<Language>, string, boolean] => i[0] != null && i[1] != null);

		const typeImports = builder
			.import()
			.types(
				["Dictionary"],
				types.map((item) => item[1]),
			)
			.from(paths.common)
			.build();

		const objTypes = builder.type().exp().record().from().tuple(types).build();

		const [prefixed_as_value_stmt, prefixed_as_value_export] = var_builder
			.typeof()
			.wrap("Dictionary<$>")
			.types([], [objTypes])
			.build();

		const [prefixed_as_value_stmt_type, prefixed_as_value_stmt_type_export] = var_builder
			.asValue()
			.type()
			.typeof(norm.typeName)
			.build();

		const content = [
			typeImports,
			"",

			"",
			prefixed_stmt,
			"",
			prefixed_as_value_stmt,
			"",
			prefixed_as_value_stmt_type,

			"",
			prefixed_stmt_export,
			"",
			prefixed_as_value_export,
			"",
			prefixed_as_value_stmt_type_export,
		].join("\n");

		return { content, norm };
	}

	return { content: "", norm };
};

export { emitManifest };
