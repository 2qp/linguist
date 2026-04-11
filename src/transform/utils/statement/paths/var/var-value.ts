import { addType, createConst, createExport, wrapAsConst } from "@/transform/utils/statement/statement-builder-utils";

import type { Primitive } from "@/types/gen.types";

const valueBuilder =
	<const TName extends Primitive>(varName: TName) =>
	//
	<const TValue extends Primitive>(value: TValue) => ({
		build: () => [createConst(varName, value, ";"), createExport(varName)] as const,

		type: <const TTypeName extends Primitive>(typeName: TTypeName) => ({
			build: () => [addType(typeName)(createConst(varName, value, ";")), createExport(varName)] as const,
		}),

		asConst: () => ({
			build: () => [wrapAsConst(createConst(varName, value, "")), createExport(varName)] as const,
			type: <const TTypeName extends Primitive>(typeName: TTypeName) => ({
				build: () => [addType(typeName)(wrapAsConst(createConst(varName, value, ""))), createExport(varName)] as const,
			}),
		}),
	});

export { valueBuilder };
