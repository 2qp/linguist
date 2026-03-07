import {
	addType,
	createConst,
	createExport,
	createExportType,
	createType,
	createTypeofType,
	extendType,
	extendTypeDef,
	getWrapped,
	wrapAsConst,
} from "./statement-builder-utils";
import { join } from "@utils/join";

import type { Primitive, ToString } from "@/types/gen.types";
import type { CustomParams, From, ImportableType, SL, TypeRef, Wrapper } from "@/types/statement.types";

type CreateStatementBuilderParams = {};

type CreateStatementBuilder = (params?: CreateStatementBuilderParams) => void;

const createStatementBuilder = () => {
	//

	const builder = {
		//

		import: () => ({
			types: <const TStrict extends ImportableType[], const TLoose extends string[]>(...args: SL<TStrict, TLoose>) => ({
				from: <const TPaths, const TPath extends keyof TPaths>(...[paths, path]: From<TPaths, TPath>) => ({
					build: () =>
						`import type { ${join([...args[0], ...args[1]], ", ")} } from "${paths[path] as ToString<TPaths[TPath]>}";` as const,
				}),
			}),

			values: <const TValues extends string[]>(values: TValues) => ({
				from: <const TPaths, const TPath extends keyof TPaths>(...[paths, path]: From<TPaths, TPath>) => ({
					build: () => `import { ${join(values, ", ")} } from "${paths[path] as ToString<TPaths[TPath]>}";` as const,
				}),
			}),
		}),

		var: <const TName extends Primitive>(varName: TName) => ({
			value: <const TValue extends Primitive>(value: TValue) => ({
				build: () => [createConst(varName, value, ";"), createExport(varName)] as const,

				type: <const TTypeName extends Primitive>(typeName: TTypeName) => ({
					build: () => [addType(typeName)(createConst(varName, value, ";")), createExport(varName)] as const,
				}),

				asConst: () => ({
					build: () => [wrapAsConst(createConst(varName, value, "")), createExport(varName)] as const,
					type: <const TTypeName extends Primitive>(typeName: TTypeName) => ({
						build: () =>
							[addType(typeName)(wrapAsConst(createConst(varName, value, ""))), createExport(varName)] as const,
					}),
				}),
			}),

			typeof: <const TTypeName extends Primitive>(_varName: TTypeName) => ({
				build: () => [createTypeofType(_varName)(varName), createExportType(_varName)] as const,
			}),

			prefix: <const TPrefix extends string>(prefix: TPrefix) => ({
				asValue: () => ({
					build: () => [createConst(varName, `${prefix}${varName}`, ";"), createExport(varName)] as const,

					type: () => ({
						wrap: <const TWrapper extends Wrapper>(wrapper: TWrapper) => ({
							types: <const TStrict extends TypeRef[], const TLoose extends string[]>(
								...args: SL<TStrict, TLoose>
							) => ({
								build: () =>
									[
										addType(getWrapped([...args[0], ...args[1]], wrapper))(
											createConst(varName, `${prefix}${varName}`, ";"),
										),
										createExport(varName),
									] as const,

								custom: <const TCName extends Primitive, const TCValue extends Primitive>(
									cb: (prev: CustomParams<TName, `${TPrefix}${TName}`>) => CustomParams<TCName, TCValue>,
								) => ({
									build: () =>
										[
											addType(getWrapped([...args[0], ...args[1]], wrapper))(
												createConst(
													cb({ name: varName, value: `${prefix}${varName}` }).name,
													cb({ name: varName, value: `${prefix}${varName}` }).value,
													";",
												),
											),
											createExport(cb({ name: varName, value: `${prefix}${varName}` }).name),
										] as const,
								}),
							}),
						}),
					}),
				}),

				value: <const TValue extends Primitive>(value: TValue) => ({
					build: () => [createConst(`${prefix}${varName}`, value, ";"), createExport(`${prefix}${varName}`)] as const,

					asConst: () => ({
						build: () =>
							[
								wrapAsConst(createConst(`${prefix}${varName}`, value, "")),
								createExport(`${prefix}${varName}`),
							] as const,
					}),

					type: <const TTypeName extends Primitive>(typeName: TTypeName) => ({
						build: () =>
							[
								addType(typeName)(createConst(`${prefix}${varName}`, value, ";")),
								createExport(`${prefix}${varName}`),
							] as const,
					}),
				}),

				type: <const TTypeName extends Primitive>(typeName: TTypeName) => ({
					build: () => [createType(typeName)(`${prefix}${varName}`), createExportType(typeName)] as const,
				}),

				typeof: () => ({
					build: () =>
						[
							addType(`typeof ${prefix}${varName}`)(createConst(varName, `${prefix}${varName}`, ";")),
							createExport(varName),
						] as const,

					wrap: <const TWrapper extends Wrapper>(wrapper: TWrapper) => ({
						types: <const TStrict extends TypeRef[], const TLoose extends string[]>(...args: SL<TStrict, TLoose>) => ({
							build: () =>
								[
									extendType("")(getWrapped([...args[0], ...args[1]], wrapper))(
										addType(`typeof ${prefix}${varName}`)(createConst(varName, `${prefix}${varName}`, ";")),
									),
									createExport(varName),
								] as const,
						}),
					}),
				}),
			}),
		}),

		type: <const TTypeName extends Primitive>(typeName: TTypeName) => ({
			//
			alias: () => ({
				//

				ref: <const TReference extends Primitive>(ref: TReference) => ({
					build: () => [createType(typeName)(ref), createExportType(typeName)] as const,
				}),

				exp: <const TExpression extends `{ ${Primitive} }`>(exp: TExpression) => ({
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
			}),
		}),
	};

	return builder;
};

export { createStatementBuilder };
export type { CreateStatementBuilder, CreateStatementBuilderParams };
