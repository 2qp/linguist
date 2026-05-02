import type { ExtractExplicit } from "@/types/utility.types";

type KeyMode = "known" | "hybrid" | "loose";

type LookupOptions<M extends KeyMode> = {
	/** `"known" | "hybrid" | "loose"` */
	keys?: M;
};

type GetManyOverloaded = {
	<I extends Record<string, unknown>, const T extends ReadonlyArray<keyof ExtractExplicit<I>>>(
		registry: I,
		keys: T,
		options?: LookupOptions<"known">,
	): { [K in keyof T]: I[T[K]] };

	<I extends Record<string, unknown>, T extends ReadonlyArray<string>>(
		registry: I,
		keys: T,
		options: LookupOptions<"hybrid">,
	): { [K in keyof T]: I[T[K]] };

	<I extends Record<string, unknown>, T extends ReadonlyArray<string>>(
		registry: I,
		keys: T,
		options: LookupOptions<"loose">,
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
