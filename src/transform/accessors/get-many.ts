import type { ExtractExplicit } from "@/types/utility.types";

type GetManyOverloaded = {
	<I extends Record<string, unknown>, const T extends readonly (keyof ExtractExplicit<I>)[]>(
		index: I,
		exts: T,
		strict?: true,
	): { [K in keyof T]: I[T[K]] };

	<I extends Record<string, unknown>, T extends string[]>(index: I, ext: T, strict: false): I[string][] | undefined;
};

type GetManyType = GetManyOverloaded;

const getMany: GetManyType = (object: object, keys: string[]) => {
	//

	const items: unknown[] = [];

	const length = keys.length;

	for (let index = 0; index < length; index++) {
		const key = keys[index];

		if (!key) continue;

		const element = object[key as keyof typeof object];

		items.push(element);
	}

	return items;
};

export { getMany };
export type { GetManyType };
