import { getUsageName } from "./get-usage-name";
import { createFieldSet } from "@gen/utils/create-field-set";
import { isNullish } from "@utils/guards";

import type { Generator } from "@gen/types";
import type { Field } from "@/types/branded.types";
import type { Config } from "@/types/config.types";
import type { Primitive } from "@/types/gen.types";
import type { LanguageData } from "@/types/lang.types";

type CreateUsageParams = {
	data: LanguageData;
	config: Config;
};

type CreateUsage = Generator<Map<Field, Record<string, ReadonlyArray<Primitive>>>>;

const createUsage: CreateUsage = ({ source, config, stats: _stats }) => {
	//

	const stats = new Map(_stats);

	const fieldSet = createFieldSet({ source, config });
	const fields = [...fieldSet].sort();

	const languages = Object.values(source);

	const fieldAnalyses = fields.map((field) => {
		//

		const isArray = stats.get(field)?.isArray;

		const map = new Map<string, Set<Primitive>>(fields.map((field) => [field, new Set<Primitive>()]));

		for (const lang of languages) {
			const value = lang[field];
			const isValid =
				value != null && (!Array.isArray(value) || value.length > 0) && lang.name != null && lang.language_id != null;

			if (!isValid) continue;

			for (const key of fields) {
				//

				if (isNullish(key)) continue;
				if (key === field) continue;

				const value = lang[key];

				const values: Primitive[] = Array.isArray(value) ? value : [value];
				const nonNullishValues = values.filter((v) => !isNullish(v));

				const exist = map.get(key);

				if (isNullish(exist)) {
					map.set(key, new Set(nonNullishValues));
					continue;
				}

				if (!nonNullishValues.length) continue;

				map.set(key, new Set([...exist, ...nonNullishValues]));
			}
		}

		const usageNames = fields
			.filter((key) => key !== field)
			.map((key) => {
				const usageKey = getUsageName({ left: key, right: field });

				const values = isArray ? [...(map.get(key) || [])].flat() : [...(map.get(key) || [])];

				return [usageKey, values];
			});

		const withStats = Object.fromEntries(usageNames);

		return [field, withStats] as const;
	});

	return new Map(fieldAnalyses);
};

export { createUsage };
export type { CreateUsage, CreateUsageParams };
