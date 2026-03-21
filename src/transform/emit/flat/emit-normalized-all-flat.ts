import { stringify } from "safe-stable-stringify";
import { normalizeName } from "@/transform/utils/normalize-name";
import { createStatementBuilder } from "@/transform/utils/statement/create-statement-builder";
import { createStatementPaths } from "@/transform/utils/statement/create-statement-paths";

import type { Language, LanguageName } from "@/types/generated.types";
import type { FlatEmitterType } from "./types";

const emitNormalizedAllFlat: FlatEmitterType = ({ config, languages }) => {
	//

	const builder = createStatementBuilder();
	const paths = createStatementPaths(config);

	const normalized: Record<string, Language> = {};
	const seenKeys = new Set<string>();

	const keys = Object.keys(languages) as LanguageName[];

	for (let i = 0; i < keys.length; i++) {
		//

		const key = keys[i];
		if (!key) continue;

		const normKey = normalizeName(key);

		const normalizedKey = normKey.varName;

		if (seenKeys.has(normalizedKey)) {
			throw new Error(`key collision detected: "${normalizedKey}"`);
		}

		const value = languages[key];
		if (!value) continue;

		seenKeys.add(normalizedKey);
		normalized[normalizedKey] = value;
	}

	const content = stringify(normalized, null, 2);

	const name = "normalized All" as const;

	const norm = normalizeName(name);

	const externalTypeImports = builder
		.import()
		.types(["Language", "FallbackForUnknownKeys"], [])
		.from(paths.common)
		.build();

	const [_var_stmt, _var_stmt_export] = builder
		.var(norm.varName)
		.prefix("_")
		.expr()
		.from()
		.value(content)
		.asConst()
		.build();

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

export { emitNormalizedAllFlat };
