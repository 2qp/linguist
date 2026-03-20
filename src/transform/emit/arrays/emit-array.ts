import { createSegmentDefs } from "@core/create-segment-defs";
import { createSegmentNames } from "@core/create-segment-names";
import { chunkArray } from "@utils/chunk-array";
import { join } from "@utils/join";
import { buildMap } from "@/transform/utils/build-map";
import { normalizeName } from "@/transform/utils/normalize-name";
import { createStatementBuilder } from "@/transform/utils/statement/create-statement-builder";
import { createStatementPaths } from "@/transform/utils/statement/create-statement-paths";

import type { Language } from "@/types/generated.types";
import type { ArrayEmitterFn, ArrayEmitterOptions } from "./types";

const emitArray: ArrayEmitterFn<ArrayEmitterOptions> = ({ name, config, languages, stats: _stats, ...params }) => {
	//

	const stats = new Map(_stats);

	const norm = normalizeName(name);

	if (params.options.kind === "custom") {
		//

		const map = buildMap({ source: languages, ...params.options });
		const arr = map.values().toArray().flat();

		const chunks = chunkArray(arr, 20);

		const segmentDefs = createSegmentDefs({ chunks, typeName: name });

		const segmentNames = createSegmentNames({ chunks, typeName: name });

		const names = segmentNames.map((seg) => `...${seg}` as const);

		const obj = `[${join(names, ", ")}]` as const;

		const segments = join(segmentDefs, "\n");

		const builder = createStatementBuilder();
		const paths = createStatementPaths(config);

		const var_builder = builder.var(norm.varName).prefix("_");

		// could use .common().tuple().key(item)
		const types = params.options.properties
			.map((item) => [item, stats.get(item)?.type, stats.get(item)?.isOptional] as const)
			.filter((i): i is [keyof Language, string, boolean] => i[0] != null && i[1] != null);

		const typeImports = builder
			.import()
			.types(
				[],
				types.map((item) => item[1]),
			)
			.from(paths.common)
			.build();

		const objTypes = builder.type().exp().record().from().tuple(types).build();

		const [prefixed_stmt, prefixed_stmt_export] = var_builder.value(obj).asConst().build();

		const [prefixed_as_value_stmt, prefixed_as_value_export] = var_builder
			.asValue()
			.type()
			.wrap("ReadonlyArray<$>")
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
			segments,
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

export { emitArray };
