import { prefixBuilder } from "./var-prefix";
import { valueBuilder } from "./var-value";
import { createExportType, createTypeofType } from "@/transform/utils/statement/statement-builder-utils";

import type { Primitive } from "@/types/gen.types";

const varBuilder = <const TName extends Primitive>(varName: TName) => ({
	value: valueBuilder(varName),

	typeof: <const TTypeName extends Primitive>(_varName: TTypeName) => ({
		build: () => [createTypeofType(_varName)(varName), createExportType(_varName)] as const,
	}),

	prefix: prefixBuilder(varName),
});

export { varBuilder };
