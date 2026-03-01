import { join } from "@utils/join";
import { buildMap } from "@/transform/utils/build-map";
import { normalizeName } from "@/transform/utils/normalize-name";
import { removeTrailingSlash } from "@/transform/utils/remove-trailing-slash";
import { createStatementBuilder } from "@/transform/utils/statement/create-statement-builder";
import { createStatementPaths } from "@/transform/utils/statement/create-statement-paths";

import type { IndexEmitterType } from "./types";

const emitLazyIndexByExtension: IndexEmitterType = ({ languages, config }): string => {
	//

	//
	const extensionMap = buildMap({ source: languages, left: "extensions", right: "name" });

	const allUniqueNames = [...new Set([...extensionMap.values()].flatMap((set) => [...set]))];

	const entries = [...extensionMap.entries()]
		.map(([ext, nameSet]) => {
			const importStatements = [...nameSet]
				.map((name) => {
					const norm = normalizeName(name);
					const langData = languages[name];
					const type = langData?.type || "programming";
					return `    import('${removeTrailingSlash(config.data.paths.typesDir)}/${type}/${norm.fileName}').then(({ ${norm.varName} }) => ${norm.varName})` as const;
				})
				.join(",\n");

			return `  "${ext}": () => Promise.all([\n${importStatements}\n  ]),` as const;
		})
		.join("\n");

	const types = [...extensionMap.entries()].map(([ext, nameSet]) => {
		const importStatements = [...nameSet]
			.map((name) => {
				const norm = normalizeName(name);
				return `${norm.typeName}` as const;
			})
			.join(", ");

		return `  "${ext}": () => Promise<[${importStatements}]>,`;
	});

	const typeImports = allUniqueNames.map((name) => {
		const norm = normalizeName(name);
		const langData = languages[name];
		const type = langData?.type || "programming";
		return ` import type { ${norm.typeName} } from "${removeTrailingSlash(config.data.paths.typesDir)}/${type}/${norm.fileName}";` as const;
	});

	const typeEntries = types.join("\n");
	const typeImportsEntries = typeImports.join("\n");

	const obj = "lazy By Extension" as const;

	const builder = createStatementBuilder();
	const norm = normalizeName(obj);
	const paths = createStatementPaths(config);

	const var_builder = builder.var(norm.varName);

	const externalTypeImports = builder
		.import()
		.types(["Language", "FallbackForUnknownKeys"], [])
		.from(paths, "commons")
		.build();

	const [var_stmt, var_export_stmt] = var_builder.value(`{\n${entries}\n}`).asConst().type(norm.typeName).build();

	const [type_stmt, type_export_stmt] = var_builder
		.type(norm.typeName)
		.def(`{\n${typeEntries}\n}`)
		.wrap("FallbackForUnknownKeys<() => Promise<$>>")
		.types(["Language[]", "undefined"], [])
		.build();

	const out = [
		typeImportsEntries,
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
