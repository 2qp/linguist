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

import type { ToString } from "@/types/gen.types";
import type { CustomP, From, ImportableType, SL, TypeRef, Wrapper } from "@/types/statement.types";

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

		var: <const TName extends string>(varName: TName) => ({
			value: <const TValue extends string>(value: TValue) => ({
				build: () => [createConst(varName, value, ";"), createExport(varName)] as const,

				type: <const TTypeName extends string>(typeName: TTypeName) => ({
					build: () =>
						[addType(typeName)(builder.var(varName).value(value).build()[0]), createExportType(typeName)] as const,
				}),

				asConst: () => ({
					build: () => wrapAsConst(createConst(varName, value, "")),
					type: <const TTypeName extends string>(typeName: TTypeName) => ({
						build: () => builder.var(varName).value(value).type(typeName).build(),
					}),
				}),
			}),

			type: <const TTypeName extends string>(typeName: TTypeName) => ({
				//
				def: <const TDef extends string>(def: TDef) => ({
					build: () => createType(typeName)(def),

					wrap: <const TWrapper extends Wrapper>(wrapper: TWrapper) => ({
						types: <const TStrict extends TypeRef[], const TLoose extends string[]>(...args: SL<TStrict, TLoose>) => ({
							build: () =>
								[
									extendTypeDef("")(getWrapped([...args[0], ...args[1]], wrapper))(
										builder.var(varName).type(typeName).def(def).build(),
									),
									createExportType(typeName),
								] as const,
						}),
					}),
				}),
			}),

			typeof: <const TTypeName extends string>(typeName: TTypeName) => ({
				build: () => [createTypeofType(typeName)(varName), createExportType(typeName)] as const,
			}),

			prefix: <const TPrefix extends string>(prefix: TPrefix) => ({
				asValue: () => ({
					build: () => createConst(varName, `${prefix}${varName}`, ";"),

					type: () => ({
						wrap: <const TWrapper extends Wrapper>(wrapper: TWrapper) => ({
							types: <const TStrict extends TypeRef[], const TLoose extends string[]>(
								...args: SL<TStrict, TLoose>
							) => ({
								build: () =>
									[
										addType(getWrapped([...args[0], ...args[1]], wrapper))(
											builder.var(varName).prefix(prefix).asValue().build(),
										),
										createExport(varName),
									] as const,

								custom: <const TCName extends string, TCValue extends string>({
									name = varName as unknown as TCName,
									value = `${prefix}${varName}` as const as unknown as TCValue,
								}: CustomP<TCName, TCValue>) => ({
									build: () =>
										[
											addType(getWrapped([...args[0], ...args[1]], wrapper))(builder.var(name).value(value).build()[0]),
											createExport(name),
										] as const,
								}),
							}),
						}),
					}),
				}),

				value: <const TValue extends string>(value: TValue) => ({
					build: () => [createConst(`${prefix}${varName}`, value, ";"), createExport(`${prefix}${varName}`)] as const,

					asConst: () => ({
						build: () => wrapAsConst(createConst(`${prefix}${varName}`, value, "")),
					}),

					type: <const TTypeName extends string>(typeName: TTypeName) => ({
						build: () =>
							[
								addType(typeName)(builder.var(varName).prefix(prefix).value(value).build()[0]),
								createExportType(typeName),
							] as const,
					}),
				}),

				type: <const TTypeName extends string>(typeName: TTypeName) => ({
					build: () => [createType(typeName)(`${prefix}${varName}`), createExportType(typeName)] as const,
				}),

				typeof: () => ({
					build: () => addType(`typeof ${prefix}${varName}`)(createConst(varName, `${prefix}${varName}`, ";")),

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
	};

	return builder;
};

export { createStatementBuilder };
export type { CreateStatementBuilder, CreateStatementBuilderParams };
