import type { Config } from "@/types/config.types";

type ShouldSplitTypesType = <T>(config: Config, names: T[]) => boolean;

const shouldSplitTypes: ShouldSplitTypesType = (config, names) => {
	return config.type.splitLargeTypes && names.length >= config.type.minItemsForSplit;
};

export { shouldSplitTypes };
export type { ShouldSplitTypesType };
