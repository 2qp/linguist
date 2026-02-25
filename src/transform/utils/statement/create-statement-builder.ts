import { createConst, createExport, createExportType, createType, wrapAsConst } from "./statement-builder-utils";
import { join } from "@utils/join";

type CreateStatementBuilderParams = {};

type CreateStatementBuilder = (params?: CreateStatementBuilderParams) => void;

const createStatementBuilder = () => {
	//

	const builder = {
		//

		import: () => ({
			types: <const TTypes extends string[]>(types: TTypes) => ({
				from: <const TPath extends string>(path: TPath) => ({
					build: () => `import type { ${join(types, ", ")} } from "${path}";` as const,
				}),
			}),

			values: <const TValues extends string[]>(values: TValues) => ({
				from: <const TPath extends string>(path: TPath) => ({
					build: () => `import { ${join(values, ", ")} } from "${path}";` as const,
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
			}),
		}),
	};

	return builder;
};

export { createStatementBuilder };
export type { CreateStatementBuilder, CreateStatementBuilderParams };
