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

export { createConst, createExport, getWrapped, wrapAsConst };
export type { Wrapper };
