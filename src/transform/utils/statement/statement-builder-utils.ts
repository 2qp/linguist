import { join } from "@utils/join";
import { safeReplacer } from "@utils/safe-replacer";

import type { Primitive } from "@/types/gen.types";
import type { Separator, Wrapper } from "@/types/statement.types";

const getWrapped = <
	const TSource extends string[],
	const TWrapper extends Wrapper = "$",
	const TSeparator extends Separator = " | ",
>(
	input: TSource,
	wrapper: TWrapper = "$" as TWrapper,
	separator: TSeparator = " | " as TSeparator,
) => safeReplacer(wrapper, "$" as const, join(input, separator));

const wrapAsConst = <const T extends Primitive>(str: T) => `${str} as const;` as const;

const createConst = <const TName extends Primitive, const TValue extends Primitive, const TTrailing extends string>(
	name: TName,
	value: TValue,
	trailing: TTrailing,
) => `const ${name} = ${value}${trailing}` as const;

const createExport = <const TName extends Primitive>(name: TName) => `export { ${name} };` as const;

const createTypeofType =
	<const TTypeName extends Primitive>(typeName: TTypeName) =>
	<const TVarName extends Primitive>(varName: TVarName) =>
		`type ${typeName} = typeof ${varName};` as const;

const createType =
	<const TTypeName extends Primitive>(typeName: TTypeName) =>
	<const TVarName extends Primitive>(varName: TVarName) =>
		`type ${typeName} = ${varName};` as const;

const addType =
	<const TType extends Primitive>(type: TType) =>
	<const TStatement extends Primitive>(str: TStatement) =>
		safeReplacer(`${str}` as const, " = ", `: ${type} = `);

const extendType =
	<const TType extends Primitive>(type: TType) =>
	<const TExtender extends Primitive>(extender: TExtender) =>
	<const TStatement extends Primitive>(str: TStatement) =>
		safeReplacer(`${str}` as const, " = ", `${type} & ${extender} = `);

const extendTypeDef =
	<const TType extends Primitive>(type: TType) =>
	<const TExtender extends Primitive>(extender: TExtender) =>
	<const TStatement extends Primitive>(str: TStatement) =>
		safeReplacer(`${str}`, "}", `} & ${type} ${extender}`);

const createExportType = <const TTypeName extends Primitive>(typeName: TTypeName) =>
	`export type { ${typeName} };` as const;

export {
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
};
