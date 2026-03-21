import { createSegmentDefs } from "@core/create-segment-defs";
import { createSegmentNames } from "@core/create-segment-names";
import { createSecondaryName } from "@gen/utils/misc/create-secondary-name";
import { chunkArray } from "@utils/chunk-array";
import { join } from "@utils/join";
import { createUniqueFieldValues } from "@/transform/utils/create-unique-field-values";
import { normalizeName } from "@/transform/utils/normalize-name";
import { createStatementBuilder } from "@/transform/utils/statement/create-statement-builder";
import { createStatementPaths } from "@/transform/utils/statement/create-statement-paths";

import type { ArrayEmitterFn, ArrayFieldEmitterOptions } from "./types";

const emitFieldArray: ArrayEmitterFn<ArrayFieldEmitterOptions> = ({ config, languages, options, name }) => {
	//

	const arr = createUniqueFieldValues({ config, source: languages, field: options.field });

	if (!arr) throw new Error(`unable to emit array of ${name}`);

	const chunks = chunkArray(arr, config.type.itemsPerSegment);

	const segmentDefs = createSegmentDefs({ chunks, typeName: name });

	const segmentNames = createSegmentNames({ chunks, typeName: name });

	const segments = join(segmentDefs, "\n");

	const names = segmentNames.map((seg) => `...${seg}` as const);

	const type = options.stats.type;

	const type_relax = createSecondaryName({ config, name: options.stats.type });

	const builder = createStatementBuilder();
	const paths = createStatementPaths(config);
	const norm = normalizeName(name);
	const norm_relax = normalizeName(`${name}_relax`);

	const typeImports = builder.import().types([], [type, type_relax]).from(paths.common).build();

	const var_builder = builder.var(norm.varName).prefix("_");
	const var_prefixed_builder = var_builder
		.asValue()
		.type()
		.wrap(options.stats.isArray ? "$" : "ReadonlyArray<$>");

	const [prefixed_stmt, prefixed_stmt_export] = var_builder.expr().from().tuple(names).asConst().build();

	const [prefixed_as_value_stmt, prefixed_as_value_export] = var_prefixed_builder.types([], [type]).build();

	const [prefixed_as_value_custom_stmt, prefixed_as_value_custom_export] = var_prefixed_builder
		.types([], [type_relax])
		.custom((exist) => ({ ...exist, name: norm_relax.varName }))
		.build();

	const [var_type_stmt, var_type_stmt_export] = builder.var(norm.varName).typeof(norm.typeName).build();

	const content = [
		typeImports,
		"",
		segments,
		"",
		prefixed_stmt,

		"",
		prefixed_as_value_stmt,
		prefixed_as_value_custom_stmt,

		"",
		var_type_stmt,

		"",
		prefixed_as_value_export,

		"",
		prefixed_as_value_custom_export,
		prefixed_stmt_export,
		"",
		var_type_stmt_export,
	].join("\n");

	return { content, norm };
};

export { emitFieldArray };
