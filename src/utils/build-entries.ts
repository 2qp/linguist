import type { Entries } from "@/types/utility.types";

type BuildEntriesParams<T extends Record<string | number | symbol, object>> = { source: T };

type BuildEntriesType = <T extends Record<string | number | symbol, object>>(params: BuildEntriesParams<T>) => T;

const buildEntries: BuildEntriesType = ({ source }) => {
	//

	const tuple = (Object.entries(source) as Entries<typeof source>).map(([key, obj]) => [key, { ...obj, name: key }]);

	return Object.fromEntries(tuple);
};

export { buildEntries };
export type { BuildEntriesParams, BuildEntriesType };
