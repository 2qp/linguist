import type { Field } from "@/types/branded.types";
import type { Config } from "@/types/config.types";
import type { WithPhase } from "@/types/phantom.types";
import type { KeyOf } from "@/types/utility.types";

type CreateFieldSetParams<T = Record<string, unknown>> = {
	source: T;
	config: Config;
};

type CreateFieldSet = <T extends Record<string, unknown>, TField extends keyof T[keyof T] | Field>(
	params: CreateFieldSetParams<T>,
) => Set<TField | Field>;

type CreateFieldSetOverloaded = {
	<T extends Record<string, unknown>, TField extends KeyOf<T[keyof T]>>(
		params: CreateFieldSetParams<T> & WithPhase<"transform">,
	): Set<TField>;

	<T extends Record<string, unknown>>(params: CreateFieldSetParams<T> & Partial<WithPhase<"generate">>): Set<Field>;
};

/**
 *
 * @param {Tag} _tag - return type discriminator
 * - `"generic"`: => set of `Field` Branded type
 * - `"typed"`: => set of `keyof T[keyof T]`
 */
const createFieldSet: CreateFieldSetOverloaded = ({ source }: CreateFieldSetParams) => {
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

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === "object" && value !== null && !Array.isArray(value);
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
	return (
		typeof value === "object" &&
		value !== null &&
		!Array.isArray(value) &&
		Object.getPrototypeOf(value) === Object.prototype
	);
};
