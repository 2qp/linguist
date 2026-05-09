import { join } from "@utils/join";
import { joinSimple } from "@utils/join-simple";
import {
	createExportType,
	createType,
	extendTypeDef,
	getWrapped,
	wrap,
	wrapEach,
	wrapTupleReversed,
} from "@/transform/utils/statement/statement-builder-utils";

import type { Primitive } from "@/types/gen.types";
import type { RecordToLiteral } from "@/types/segment.types";
import type { Separator, SL, TypeRef, Wrapper } from "@/types/statement.types";

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
					wrap: <const TWrapper extends Wrapper, const TSeparator extends Separator = " | ">(
						wrapper: TWrapper,
						separator: TSeparator = " | " as TSeparator,
					) => ({
						//

						type: () => {
							//

							const builder = <
								const T extends string,
								const W extends Wrapper,
								const A extends readonly (readonly [T, W])[],
							>(
								children: A = [] as unknown as A,
							) => ({
								//

								add: <const CT extends TypeRef | (string & {}), const CW extends W>(content: readonly [CT, CW]) =>
									builder([content, ...children] as const),

								build: () =>
									[
										extendTypeDef("")(wrap(joinSimple(wrapTupleReversed([...children] as const), separator), wrapper))(
											createType(typeName)(`{ ${exp.join("\n")} }`),
										),

										createExportType(typeName),
									] as const,
							});

							return builder();
						},

						each: <const TEWrapper extends Wrapper, const TESeparator extends Separator = " | ">(
							w: TEWrapper,
							s: TESeparator = " | " as TESeparator,
						) => ({
							types: <const TStrict extends readonly TypeRef[], const TLoose extends readonly string[]>(
								...args: SL<TStrict, TLoose>
							) => ({
								build: () =>
									[
										extendTypeDef("")(wrap(join(wrapEach([...args[0], ...args[1]], w), s), wrapper))(
											createType(typeName)(`{ ${exp.join("\n")} }`),
										),
										createExportType(typeName),
									] as const,
							}),
						}),

						types: <const TStrict extends readonly TypeRef[], const TLoose extends readonly string[]>(
							...args: SL<TStrict, TLoose>
						) => ({
							build: () =>
								[
									extendTypeDef("")(getWrapped([...args[0], ...args[1]], wrapper, separator))(
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
