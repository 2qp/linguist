import type { ManyOptions } from "@/types/accessors.types";
import type { AwaitedReturnOrSelf, SyncOrAsyncFn } from "@/types/data-utility.types";
import type { Explicit } from "@/types/utility.types";

type GetLazyManyOverloaded = {
	//

	<I extends Record<string, unknown>, const T extends ReadonlyArray<keyof Explicit<I>>>(
		registry: I,
		keys: T,
		options?: ManyOptions<"known">,
	): Promise<{ [K in keyof T]: AwaitedReturnOrSelf<I[T[K]]> }>;

	<I extends Record<string, unknown>, const T extends ReadonlyArray<string>>(
		registry: I,
		keys: T,
		options: ManyOptions<"hybrid">,
	): Promise<{ [K in keyof T]: AwaitedReturnOrSelf<I[T[K]]> }>;

	<I extends Record<string, unknown>, const T extends ReadonlyArray<string>>(
		registry: I,
		keys: T,
		options: ManyOptions<"loose">,
	): Promise<AwaitedReturnOrSelf<I[string]>[]>;
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
