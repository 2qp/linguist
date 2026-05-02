import type { ExtractExplicit } from "@/types/utility.types";

type LookupOptions<S extends boolean = boolean> = { known?: S };

type GetManyOverloaded = {
	<I extends Record<string, unknown>, const T extends readonly (keyof ExtractExplicit<I>)[]>(
		registry: I,
		keys: T,
		options?: LookupOptions<true>,
	): { [K in keyof T]: I[T[K]] };

	<I extends Record<string, unknown>, T extends string[]>(
		registry: I,
		keys: T,
		options: LookupOptions<false>,
	): I[string][] | undefined;
};

type GetManyType = GetManyOverloaded;

const getMany: GetManyType = (registry: Record<string, unknown>, keys: string[]) => {
	//

	const items: unknown[] = [];

	const length = keys.length;

	for (let index = 0; index < length; index++) {
		const key = keys[index];

		if (!key) continue;

		const element = registry[key as keyof typeof registry];

		items.push(element);
	}

	return items;
};

export { getMany };
export type { GetManyType, LookupOptions };
