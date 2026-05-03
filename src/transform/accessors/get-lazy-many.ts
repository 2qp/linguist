import type { AwaitedReturnOrSelf, SyncOrAsyncFn } from "@/types/data-utility.types";
import type { ExtractExplicit } from "@/types/utility.types";

type KeyMode = "known" | "loose" | "hybrid";

type LazyLookupOptions<M extends KeyMode> = {
	/** `"known" | "hybrid" | "loose"` */
	keys?: M;
};

type GetLazyManyOverloaded = {
	//

	<I extends Record<string, unknown>, const T extends ReadonlyArray<keyof ExtractExplicit<I>>>(
		registry: I,
		keys: T,
		options?: LazyLookupOptions<"known">,
	): Promise<{ [K in keyof T]: AwaitedReturnOrSelf<I[T[K]]> }>;

	<I extends Record<string, unknown>, const T extends ReadonlyArray<string>>(
		registry: I,
		keys: T,
		options: LazyLookupOptions<"hybrid">,
	): Promise<{ [K in keyof T]: AwaitedReturnOrSelf<I[T[K]]> }>;

	<I extends Record<string, unknown>, const T extends ReadonlyArray<string>>(
		registry: I,
		keys: T,
		options: LazyLookupOptions<"loose">,
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
export type { GetLazyManyType, LazyLookupOptions };
