import type { Field } from "@/types/branded.types";
import type { Config } from "@/types/config.types";
import type { LanguageData } from "@/types/lang.types";

type CreateFieldSetParams = {
	source: LanguageData;
	config: Config;
};

type CreateFieldSet = (params: CreateFieldSetParams) => Set<Field>;

const createFieldSet: CreateFieldSet = ({ source }) => {
	//

	const fields = new Set<Field>();

	//
	for (const name of Object.keys(source)) {
		if (!name) continue;

		const language = source[name];
		if (!language) continue;

		for (const element of Object.keys(language)) {
			fields.add(element as Field);
		}
	}

	return fields;
};

export { createFieldSet };
export type { CreateFieldSetParams, CreateFieldSet };
