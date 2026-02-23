import { isNullish } from "@utils/guards";

import type { Config } from "@/types/config.types";
import type { HomogeneousArray } from "@/types/utility.types";

type CreateValueArrayParams<TSource extends Record<string, unknown>, TField extends keyof TSource[keyof TSource]> = {
	source: TSource;
	field: TField;
	config: Config;
};

// type CreateValueArray = <
// 	const TSource extends Record<string, unknown>,
// 	const TField extends keyof TSource[keyof TSource],
// >(
// 	params: CreateValueArrayParams<TSource, TField>,
// ) => HomogeneousArray<TSource, TField>;

const createValueArray = <
	const TSource extends Record<string, unknown>,
	const TField extends keyof TSource[keyof TSource],
>({
	source,
	field,
}: CreateValueArrayParams<TSource, TField>): HomogeneousArray<TSource, TField> => {
	//

	const values = new Set();

	for (const name of Object.keys(source) as (keyof TSource)[]) {
		if (!name) continue;

		const language = source[name];
		if (!language) continue;

		const element = language[field] as TSource[keyof TSource][TField];
		if (isNullish(element)) continue;

		if (!Array.isArray(element)) {
			values.add(element);
			continue;
		}

		// const ar = element as unknown as T[keyof T][keyof T[keyof T]][keyof T[keyof T][keyof T[keyof T]]] & unknown[];

		for (const item of element) {
			values.add(item);
		}
	}

	return [...values] as HomogeneousArray<TSource, TField>;
};

export { createValueArray };
export type { CreateValueArrayParams };
