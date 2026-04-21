import type { Entries } from "@/types/utility.types";

type BuildEntriesParams<T extends Record<PropertyKey, object>> = { source: T };

type BuildEntriesType = <T extends Record<PropertyKey, object>, R = T>(params: BuildEntriesParams<T>) => R;

const buildEntries: BuildEntriesType = ({ source }) => {
	//

	const tuple = (Object.entries(source) as Entries<typeof source>).map(([key, obj]) => [key, { ...obj, name: key }]);

	return Object.fromEntries(tuple);
};

export { buildEntries };
export type { BuildEntriesParams, BuildEntriesType };
