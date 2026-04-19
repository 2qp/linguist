import { stringify } from "safe-stable-stringify";
import { addType, createConst, createExport, wrapAsConst } from "@/transform/utils/statement/statement-builder-utils";

import type { Primitive } from "@/types/gen.types";

const recordBuilder =
	<const TName extends Primitive>(varName: TName) =>
	//
	() => ({
		from: () => ({
			//

			tuple: <const TValue extends ReadonlyArray<Primitive>>(value: TValue) => ({
				build: () => [createConst(varName, `{ ${value.join("\n")} }`, ";"), createExport(varName)] as const,

				type: <const TTypeName extends Primitive>(typeName: TTypeName) => ({
					build: () =>
						[addType(typeName)(createConst(varName, `{ ${value.join("\n")} }`, ";")), createExport(varName)] as const,
				}),

				asConst: () => ({
					build: () =>
						[wrapAsConst(createConst(varName, `{ ${value.join("\n")} }`, "")), createExport(varName)] as const,
					type: <const TTypeName extends Primitive>(typeName: TTypeName) => ({
						build: () =>
							[
								addType(typeName)(wrapAsConst(createConst(varName, `{ ${value.join("\n")} }`, ""))),
								createExport(varName),
							] as const,
					}),
				}),
			}),

			//
			record: <const TValue extends Record<PropertyKey, unknown>>(value: TValue) => ({
				build: () => [createConst(varName, `${stringify(value, null, 2)}`, ";"), createExport(varName)] as const,

				// type:

				asConst: () => ({
					build: () =>
						[wrapAsConst(createConst(varName, `${stringify(value, null, 2)}`, "")), createExport(varName)] as const,

					// type:
				}),
			}),
		}),
	});

export { recordBuilder };
