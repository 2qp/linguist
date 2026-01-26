import type { AwaitedReturnOrSelf } from "@/types/data-utility.types";

type GetOneOverloaded = {
	<I, T extends keyof I>(index: I, ext: T): Promise<AwaitedReturnOrSelf<I[T]>>;

	<I, T extends string>(index: I, ext: T): Promise<AwaitedReturnOrSelf<I[keyof I]> | undefined>;
};

// type GetLazyOneParams = {};

type GetLazyOneType = GetOneOverloaded;

const getLazyOne: GetLazyOneType = async (index: object, ext: string) => {
	//

	const loader: () => Promise<unknown> = index[ext as keyof typeof index];

	if (!loader) return undefined;

	const modules = await loader();

	return modules;
};

export { getLazyOne };
export type { GetLazyOneType };
