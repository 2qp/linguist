import type { ManyOptions } from "@/types/accessors.types";
import type { AwaitedReturnOrSelf, SyncOrAsyncFn } from "@/types/data-utility.types";
import type { ExplicitKeys } from "@/types/utility.types";

type GetLazyManyOverloaded = {
	//

	<const I extends Record<string, unknown>, const T extends ExplicitKeys<I>>(
		registry: I,
		keys: T,
		options?: ManyOptions<"known">,
	): Promise<{ [K in keyof T]: AwaitedReturnOrSelf<I[T[K]]> }>;

	<const I extends Record<string, unknown>, const T extends readonly string[], E extends ExplicitKeys<I>>(
		registry: I,
		keys: T | E,
		options: ManyOptions<"hybrid">,
	): Promise<{ [K in keyof T]: AwaitedReturnOrSelf<I[T[K]]> }>;

	<const I extends Record<string, unknown>, const T extends readonly string[], E extends ExplicitKeys<I>>(
		registry: I,
		keys: T | E,
		options: ManyOptions<"loose">,
	): Promise<readonly AwaitedReturnOrSelf<I[string]>[]>;
};

type GetLazyManyType = GetLazyManyOverloaded;

const getLazyMany: GetLazyManyType = async (registry: Record<string, SyncOrAsyncFn>, keys: string[]) => {
	//

	const length = keys.length;
	const items: unknown[] = new Array(length);

	for (let index = 0; index < length; index++) {
		const key = keys[index];

		if (!key) continue;

		const loader = registry[key as keyof typeof registry];

		if (!loader) {
			items[index] = undefined;
			continue;
		}

		const modules = await loader();

		items[index] = modules;
	}

	return items;
};

export { getLazyMany };
export type { GetLazyManyType };
