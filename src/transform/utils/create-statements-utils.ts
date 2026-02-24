import { join } from "@utils/join";
import { safeReplacer } from "@utils/safe-replacer";

type Wrapper = "ReadonlyArray<$>" | "Partial<$>" | "$";

const getWrapped = <const TSource extends string[], TWrapper extends Wrapper>(
	input: TSource,
	wrapper: TWrapper = "$" as TWrapper,
) => safeReplacer(wrapper, "$" as const, join(input, " | "));

export { getWrapped };
