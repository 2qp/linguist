import { join } from "@utils/join";
import { buildMap } from "@/transform/utils/build-map";
import { normalizeName } from "@/transform/utils/normalize-name";
import { createStatementBuilder } from "@/transform/utils/statement/create-statement-builder";
import { createStatementPaths } from "@/transform/utils/statement/create-statement-paths";

import type { IndexEmitterType } from "./types";

const emitLazyIndexByExtension: IndexEmitterType = ({ languages, config }): string => {
	//

	//
	const map = buildMap({ source: languages, left: "extensions", right: "name", kind: "set" });

	const builder = createStatementBuilder();

	const result = [...map].map(([ext, nameSet]) => {
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
				.from([config.data.paths.typesDir, "/", type, "/", norm.fileName])
				.then_(varName)
				.build();

			const typeImports = builder
				.import()
				.types([], [typeName])
				.from(config.data.paths.typesDir, "/", type, "/", norm.fileName)
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

	const vars = result.map((item) => item.vars);
	const types = result.map((item) => item.types);
	const typeImports = [...new Set(result.flatMap((item) => item.typeImports))];

	const obj = "lazy By Extension" as const;

	const norm = normalizeName(obj);
	const paths = createStatementPaths(config);

	const externalTypeImports = builder
		.import()
		.types(["Language", "FallbackForUnknownKeys"], [])
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
		.wrap("FallbackForUnknownKeys<() => Promise<$>>")
		.types(["Language[]", "undefined"], [])
		.build();

	const out = [
		typeImports.join("\n"),
		externalTypeImports,
		//
		var_stmt,
		type_stmt,
		//
		var_export_stmt,
		type_export_stmt,
	] as const;

	const stringifiedOut = join(out, "\n\n");

	return stringifiedOut;
};

export { emitLazyIndexByExtension };
