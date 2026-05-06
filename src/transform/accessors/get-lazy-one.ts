import type { OneOptions } from "@/types/accessors.types";
import type { AwaitedReturnOrSelf, SyncOrAsyncFn } from "@/types/data-utility.types";
import type { Explicit } from "@/types/utility.types";

type GetLazyOneOverloaded = {
	<const I, T extends keyof I>(registry: I, key: T): Promise<AwaitedReturnOrSelf<I[T]>>;

	<const I, T extends string>(registry: I, key: T): Promise<AwaitedReturnOrSelf<I[keyof I]> | undefined>;

	<const I extends Record<string, unknown>, T extends keyof Explicit<I>>(
		registry: I,
		key: T,
		options: OneOptions<"known">,
	): Promise<AwaitedReturnOrSelf<I[T]>>;
};

// type GetLazyOneParams = {};

type GetLazyOneType = GetLazyOneOverloaded;

const getLazyOne: GetLazyOneType = async (registry: Record<string, SyncOrAsyncFn>, key: string) => {
	//

	const loader = registry[key as keyof typeof registry];

	if (!loader) return undefined;

	const modules = await loader();

	return modules;
};

export { getLazyOne };
export type { GetLazyOneType };
