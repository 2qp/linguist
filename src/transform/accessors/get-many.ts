import type { ManyOptions } from "@/types/accessors.types";
import type { ExplicitKeys } from "@/types/utility.types";

type GetManyOverloaded = {
	<const I extends Record<string, unknown>, const T extends ExplicitKeys<I>>(
		registry: I,
		keys: T,
		options?: ManyOptions<"known">,
	): { [K in keyof T]: I[T[K]] };

	<const I extends Record<string, unknown>, const T extends readonly string[], E extends ExplicitKeys<I>>(
		registry: I,
		keys: T | E,
		options: ManyOptions<"hybrid">,
	): { [K in keyof T]: I[T[K]] };

	<const I extends Record<string, unknown>, const T extends readonly string[], E extends ExplicitKeys<I>>(
		registry: I,
		keys: T | E,
		options: ManyOptions<"loose">,
	): readonly I[string][];
};

type GetManyType = GetManyOverloaded;

const getMany: GetManyType = (registry: Record<string, unknown>, keys: string[]) => {
	//

	const length = keys.length;

	const items: unknown[] = new Array(length);

	for (let index = 0; index < length; index++) {
		const key = keys[index];

		if (!key) continue;

		const element = registry[key as keyof typeof registry];

		items[index] = element;
	}

	return items;
};

export { getMany };
export type { GetManyType };
