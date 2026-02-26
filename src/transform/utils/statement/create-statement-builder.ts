import {
	addType,
	createConst,
	createExport,
	createExportType,
	createType,
	extendType,
	getWrapped,
	wrapAsConst,
} from "./statement-builder-utils";
import { join } from "@utils/join";

import type { ToString } from "@/types/gen.types";
import type { From, ImportableType, SL, TypeRef, Wrapper } from "@/types/statement.types";

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
				build: () => createConst(varName, value, ";"),

				asConst: () => ({
					build: () => wrapAsConst(createConst(varName, value, "")),
				}),

				export: () => ({
					build: () => createExport(varName),
				}),
			}),

			type: <const TTypeName extends string>(typeName: TTypeName) => ({
				build: () => createType(typeName)(varName),
				export: () => ({
					build: () => createExportType(typeName),
				}),
			}),

			//
			prefix: <const TPrefix extends string>(prefix: TPrefix) => ({
				value: <const TValue extends string>(value: TValue) => ({
					build: () => createConst(`${prefix}${varName}`, value, ";"),

					asConst: () => ({
						build: () => wrapAsConst(createConst(`${prefix}${varName}`, value, "")),
					}),

					export: () => ({
						build: () => createExport(`${prefix}${varName}`),
					}),
				}),

				type: <const TTypeName extends string>(typeName: TTypeName) => ({
					build: () => createType(typeName)(`${prefix}${varName}`),
					export: () => ({
						build: () => createExportType(typeName),
					}),
				}),

				typeof: () => ({
					build: () => addType(`typeof ${prefix}${varName}`)(createConst(varName, `${prefix}${varName}`, ";")),

					wrap: <const TWrapper extends Wrapper>(wrapper: TWrapper) => ({
						types: <const TStrict extends TypeRef[], const TLoose extends string[]>(...args: SL<TStrict, TLoose>) => ({
							build: () =>
								extendType("")(getWrapped([...args[0], ...args[1]], wrapper))(
									addType(`typeof ${prefix}${varName}`)(createConst(varName, `${prefix}${varName}`, ";")),
								),
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
