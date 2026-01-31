import type { AwaitedReturnOrSelf, SyncOrAsyncFn } from "@/types/data-utility.types";
import type { ExtractExplicit } from "@/types/utility.types";

type GetLazyManyOverloaded = {
	//

	<I extends Record<string, unknown>, const T extends readonly (keyof ExtractExplicit<I>)[]>(
		registry: I,
		keys: T,
		strict?: true,
	): Promise<{ [K in keyof T]: AwaitedReturnOrSelf<I[T[K]]> }>;

	<I extends Record<string, unknown>, T extends string[]>(
		registry: I,
		keys: T,
		strict: false,
	): Promise<AwaitedReturnOrSelf<I[string]>[] | undefined>;
};

type GetLazyManyType = GetLazyManyOverloaded;

const getLazyMany: GetLazyManyType = async (registry: Record<string, SyncOrAsyncFn>, keys: string[]) => {
	//

	const items: unknown[] = [];

	const length = keys.length;

	for (let index = 0; index < length; index++) {
		const key = keys[index];

		if (!key) continue;

		const loader = registry[key as keyof typeof registry];

		if (!loader) continue;

		const modules = await loader();

		items.push(modules);
	}

	return items;
};

export { getLazyMany };
export type { GetLazyManyType };
