import type { Field } from "@/types/branded.types";
import type { Config } from "@/types/config.types";
import type { LanguageFields } from "@/types/lang.types";
import type { WithPhase } from "@/types/phantom.types";

type CreateCommonOptionalFieldSetParams<T = Record<string, unknown>> = {
	source: T;
	config: Config;
};

type CreateCommonOptionalFieldSet = <T extends Record<string, unknown>, TField extends keyof T[keyof T] | Field>(
	params: CreateCommonOptionalFieldSetParams<T>,
) => Set<TField | Field>;

type CreateCommonOptionalFieldSetOverloaded = {
	<T extends Record<string, unknown>, TField extends keyof T[keyof T]>(
		params: CreateCommonOptionalFieldSetParams<T> & WithPhase<"transform">,
	): { common: Set<TField>; optional: Set<TField> };

	<T extends Record<string, unknown>>(
		params: CreateCommonOptionalFieldSetParams<T> & Partial<WithPhase<"generate">>,
	): { common: Set<Field>; optional: Set<Field> };
};

/**
 *
 * @param {Tag} _tag - return type discriminator
 * - `"generic"`: => set of `Field` Branded type
 * - `"typed"`: => set of `keyof T[keyof T]`
 */
const createCommonOptionalFieldSet: CreateCommonOptionalFieldSetOverloaded = ({
	source,
}: CreateCommonOptionalFieldSetParams) => {
	//

	const fields = new Set<Field>();
	const common = new Set<Field>();
	const optional = new Set<Field>();

	const fieldCount = new Map<Field, number>();

	//
	for (const name of Object.keys(source)) {
		if (!name) continue;

		const language = source[name];
		if (!language) continue;

		for (const element of Object.keys(language)) {
			fields.add(element as Field);
		}
	}

	const languageObjects = Object.values(source) as LanguageFields[];

	for (const obj of languageObjects) {
		for (const key of Object.keys(obj) as Field[]) {
			fieldCount.set(key, (fieldCount.get(key) ?? 0) + 1);
		}
	}

	for (const field of fields) {
		const count = fieldCount.get(field) ?? 0;

		if (count === languageObjects.length) {
			common.add(field);
			continue;
		}

		optional.add(field);
	}

	return { common, optional };
};

export { createCommonOptionalFieldSet };
export type { CreateCommonOptionalFieldSetParams, CreateCommonOptionalFieldSet };
