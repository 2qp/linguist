import { join } from "@utils/join";
import {
	createExportType,
	createType,
	extendTypeDef,
	getWrapped,
} from "@/transform/utils/statement/statement-builder-utils";

import type { Primitive } from "@/types/gen.types";
import type { RecordToLiteral } from "@/types/segment.types";
import type { SL, TypeRef, Wrapper } from "@/types/statement.types";

const typeBuilder = () => ({
	//
	alias: <const TTypeName extends Primitive>(typeName: TTypeName) => ({
		//

		ref: <const TReference extends Primitive>(ref: TReference) => ({
			build: () => [createType(typeName)(ref), createExportType(typeName)] as const,
		}),

		exp: () => ({
			from: () => ({
				record: <const TExpression extends `{ ${Primitive} }`>(exp: TExpression) => ({
					wrap: <const TWrapper extends Wrapper>(wrapper: TWrapper) => ({
						types: <const TStrict extends TypeRef[], const TLoose extends string[]>(...args: SL<TStrict, TLoose>) => ({
							build: () =>
								[
									extendTypeDef("")(getWrapped([...args[0], ...args[1]], wrapper))(createType(typeName)(exp)),
									createExportType(typeName),
								] as const,
						}),
					}),
				}),

				tuple: <const TExpressions extends ReadonlyArray<Primitive>>(exp: TExpressions) => ({
					wrap: <const TWrapper extends Wrapper>(wrapper: TWrapper) => ({
						types: <const TStrict extends TypeRef[], const TLoose extends string[]>(...args: SL<TStrict, TLoose>) => ({
							build: () =>
								[
									extendTypeDef("")(getWrapped([...args[0], ...args[1]], wrapper))(
										createType(typeName)(`{ ${exp.join("\n")} }`),
									),
									createExportType(typeName),
								] as const,
						}),
					}),
				}),
			}),
		}),
	}),

	exp: () => ({
		record: () => ({
			from: () => ({
				tuple: <const T extends readonly (readonly [K, unknown, unknown])[], const K extends string | number>(
					pairs: T,
				) => ({
					build: () =>
						`{ ${join(
							pairs.map(([key, value, isOptional]) => `${key}${isOptional ? "?" : ""}: ${value}` as const),
							", ",
						)} }` as const as RecordToLiteral<{ [K in T[number][0] as `${K}`]: T[number][1] }, { partial: false }>,
				}),
			}),
		}),
	}),
});

export { typeBuilder };
