import {
	addType,
	createConst,
	createExport,
	createExportType,
	createType,
	createTypeofType,
	extendType,
	getWrapped,
	wrapAsConst,
} from "@/transform/utils/statement/statement-builder-utils";

import type { Primitive } from "@/types/gen.types";
import type { CustomParams, SL, TypeRef, Wrapper } from "@/types/statement.types";

const prefixBuilder =
	<const TName extends Primitive>(varName: TName) =>
	//
	<const TPrefix extends string>(prefix: TPrefix) => ({
		asValue: asValueBuilder(varName)(prefix),

		value: valueBuilder(varName)(prefix),

		type: <const TTypeName extends Primitive>(typeName: TTypeName) => ({
			build: () => [createType(typeName)(`${prefix}${varName}`), createExportType(typeName)] as const,
		}),

		typeof: typeofBuilder(varName)(prefix),
	});

const asValueBuilder =
	<const TName extends Primitive>(varName: TName) =>
	<const TPrefix extends string>(prefix: TPrefix) =>
	() => ({
		build: () => [createConst(varName, `${prefix}${varName}`, ";"), createExport(varName)] as const,

		type: () => ({
			wrap: <const TWrapper extends Wrapper>(wrapper: TWrapper) => ({
				types: <const TStrict extends TypeRef[], const TLoose extends string[]>(...args: SL<TStrict, TLoose>) => ({
					build: () =>
						[
							addType(getWrapped([...args[0], ...args[1]], wrapper))(createConst(varName, `${prefix}${varName}`, ";")),
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

			typeof: <const TTypeName extends Primitive>(typeName: TTypeName) => ({
				build: () => [createTypeofType(typeName)(varName), createExportType(typeName)] as const,
			}),
		}),
	});

const valueBuilder =
	<const TName extends Primitive>(varName: TName) =>
	<const TPrefix extends string>(prefix: TPrefix) =>
	<const TValue extends Primitive>(value: TValue) => ({
		build: () => [createConst(`${prefix}${varName}`, value, ";"), createExport(`${prefix}${varName}`)] as const,

		asConst: () => ({
			build: () =>
				[wrapAsConst(createConst(`${prefix}${varName}`, value, "")), createExport(`${prefix}${varName}`)] as const,

			wrap: <const TWrapper extends Wrapper>(wrapper: TWrapper) => ({
				build: () =>
					[
						wrapAsConst(createConst(`${prefix}${varName}`, getWrapped([`${value}`], wrapper, ", "), "")),
						createExport(`${prefix}${varName}`),
					] as const,
			}),
		}),

		type: <const TTypeName extends Primitive>(typeName: TTypeName) => ({
			build: () =>
				[
					addType(typeName)(createConst(`${prefix}${varName}`, value, ";")),
					createExport(`${prefix}${varName}`),
				] as const,
		}),
	});

const typeofBuilder =
	<const TName extends Primitive>(varName: TName) =>
	<const TPrefix extends string>(prefix: TPrefix) =>
	() => ({
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
	});

export { prefixBuilder };
