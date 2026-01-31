import type { AwaitedReturnOrSelf, SyncOrAsyncFn } from "@/types/data-utility.types";

type GetLazyOneOverloaded = {
	<I, T extends keyof I>(registry: I, key: T): Promise<AwaitedReturnOrSelf<I[T]>>;

	<I, T extends string>(registry: I, key: T): Promise<AwaitedReturnOrSelf<I[keyof I]> | undefined>;
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
