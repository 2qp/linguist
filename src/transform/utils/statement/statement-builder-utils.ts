import { join } from "@utils/join";
import { safeReplacer } from "@utils/safe-replacer";

type Wrapper = "ReadonlyArray<$>" | "Partial<$>" | "FallbackForUnknownKeys<$>" | "$";

const getWrapped = <const TSource extends string[], TWrapper extends Wrapper>(
	input: TSource,
	wrapper: TWrapper = "$" as TWrapper,
) => safeReplacer(wrapper, "$" as const, join(input, " | "));

const wrapAsConst = <const T extends string>(str: T) => `${str} as const;` as const;

const createConst = <const TName extends string, const TValue extends string>(name: TName, value: TValue) =>
	`const ${name} = ${value}` as const;

const createExport = <const TName extends string>(name: TName) => `export { ${name} };` as const;

const createType =
	<const TTypeName extends string>(typeName: TTypeName) =>
	<const TVarName extends string>(varName: TVarName) =>
		`type ${typeName} = typeof ${varName};` as const;

const createExportType = <const TTypeName extends string>(typeName: TTypeName) =>
	`export type { ${typeName} };` as const;

export { createConst, createExport, createExportType, createType, getWrapped, wrapAsConst };
export type { Wrapper };
