import { stringify } from "safe-stable-stringify";
import { normalizeName } from "@/transform/utils/normalize-name";
import { createStatementBuilder } from "@/transform/utils/statement/create-statement-builder";
import { createStatementPaths } from "@/transform/utils/statement/create-statement-paths";

import type { FlatEmitterType } from "./types";

const emitJSONFlat: FlatEmitterType = ({ languages, config }) => {
	//

	const builder = createStatementBuilder();
	const paths = createStatementPaths(config);

	const content = stringify(languages, null, 2);

	const name = "all" as const;
	const norm = normalizeName(name);

	const externalTypeImports = builder
		.import()
		.types(["Language", "FallbackForUnknownKeys"], [])
		.from(paths.common)
		.build();

	const [_var_stmt, _var_stmt_export] = builder.var(norm.varName).prefix("_").value(content).asConst().build();

	const [var_stmt, var_stmt_export] = builder
		.var(norm.varName)
		.prefix("_")
		.typeof()
		.wrap("FallbackForUnknownKeys<$>")
		.types(["Language", "undefined"], [])
		.build();

	const [type_stmt, type_stmt_export] = builder.var(norm.varName).typeof(norm.typeName).build();

	const statements = (
		[
			externalTypeImports,
			_var_stmt,
			var_stmt,
			type_stmt,

			_var_stmt_export,
			var_stmt_export,
			type_stmt_export,
		] as const
	).join("\n\n");

	return statements;
};

export { emitJSONFlat };
