import { join } from "@utils/join";
import { safeReplacer } from "@utils/safe-replacer";

import type { Wrapper } from "@/types/statement.types";

const getWrapped = <const TSource extends string[], TWrapper extends Wrapper>(
	input: TSource,
	wrapper: TWrapper = "$" as TWrapper,
) => safeReplacer(wrapper, "$" as const, join(input, " | "));

const wrapAsConst = <const T extends string>(str: T) => `${str} as const;` as const;

const createConst = <const TName extends string, const TValue extends string, const TTrailing extends string>(
	name: TName,
	value: TValue,
	trailing: TTrailing,
) => `const ${name} = ${value}${trailing}` as const;

const createExport = <const TName extends string>(name: TName) => `export { ${name} };` as const;

const createType =
	<const TTypeName extends string>(typeName: TTypeName) =>
	<const TVarName extends string>(varName: TVarName) =>
		`type ${typeName} = typeof ${varName};` as const;

const addType =
	<const TType extends string>(type: TType) =>
	<const TStatement extends string>(str: TStatement) =>
		safeReplacer(str, " = ", `: ${type} = `);

const extendType =
	<const TType extends string>(type: TType) =>
	<const TExtender extends string>(extender: TExtender) =>
	<const TStatement extends string>(str: TStatement) =>
		safeReplacer(str, " = ", `${type} & ${extender} = `);

const createExportType = <const TTypeName extends string>(typeName: TTypeName) =>
	`export type { ${typeName} };` as const;

export { addType, createConst, createExport, createExportType, createType, extendType, getWrapped, wrapAsConst };
