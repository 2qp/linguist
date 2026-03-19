import { isNullish } from "@utils/guards";

import type { Config } from "@/types/config.types";
import type { HomogeneousArray } from "@/types/utility.types";

type createFieldValuesParams<TSource extends Record<string, unknown>, TField extends keyof TSource[keyof TSource]> = {
	source: TSource;
	field: TField;
	config: Config;
};

const createFieldValues = <
	const TSource extends Record<string, unknown>,
	const TField extends keyof TSource[keyof TSource],
>({
	source,
	field,
}: createFieldValuesParams<TSource, TField>): HomogeneousArray<TSource, TField> => {
	//

	// mmm immutable :(
	const values = [];

	for (const name of Object.keys(source) as (keyof TSource)[]) {
		if (!name) continue;

		const language = source[name];
		if (!language) continue;

		const element = language[field] as TSource[keyof TSource][TField];
		if (isNullish(element)) continue;

		if (!Array.isArray(element)) {
			values.push(element);
			continue;
		}

		for (const item of element) {
			if (isNullish(item)) continue;
			values.push(item);
		}
	}

	return values as HomogeneousArray<TSource, TField>;
};

export { createFieldValues };
export type { createFieldValuesParams };
