import { getUsageName } from "./get-usage-name";
import { createFieldSet } from "@gen/utils/create-field-set";

import type { Field } from "@/types/branded.types";
import type { Config } from "@/types/config.types";
import type { LanguageData } from "@/types/lang.types";

type CreateUsageParams = {
	data: LanguageData;
	config: Config;
};

type CreateUsage = (params: CreateUsageParams) => Map<Field, Record<string, ReadonlyArray<string>>>;

const createUsage: CreateUsage = ({ data, config }) => {
	//

	const fieldSet = createFieldSet({ source: data, config });
	const fields = [...fieldSet].sort();

	const languages = Object.values(data);

	const fieldAnalyses = fields.map((field) => {
		const idsSet = new Set<string>();
		const namesSet = new Set<string>();
		const typeSet = new Set<string>();

		for (const lang of languages) {
			const value = lang[field];
			const isValid =
				value != null && (!Array.isArray(value) || value.length > 0) && lang.name != null && lang.language_id != null;

			if (!isValid) continue;

			idsSet.add(lang.language_id as string);
			namesSet.add(lang.name as string);
			typeSet.add(lang.type as string);
		}

		const language_id_with = getUsageName({ left: "language_id", right: field });
		const name_with = getUsageName({ left: "name", right: field });
		const type_with = getUsageName({ left: "type", right: field });

		const withStats = {
			[language_id_with]: [...idsSet],
			[name_with]: [...namesSet],
			[type_with]: [...typeSet],
		} as const;

		return [field, withStats] as const;
	});

	return new Map(fieldAnalyses);
};

export { createUsage };
export type { CreateUsage, CreateUsageParams };
