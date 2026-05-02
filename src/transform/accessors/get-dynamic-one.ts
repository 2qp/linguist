import type { OptionalBrand } from "@/types/branded.types";

type GetDynamicOneParams = {};

type ExtractPayload<T> = T extends OptionalBrand<unknown, infer U> ? U : never;

type GetDynamicOneOverloaded = {
	<const I, const T extends keyof I>(registry: I, key: T): Promise<ExtractPayload<I[T]>>;

	<const I, const T extends string>(registry: I, key: T): Promise<I[keyof I] | undefined>;
};

type GetDynamicOne = GetDynamicOneOverloaded;

const getDynamicOne: GetDynamicOne = async (registry: Record<string, ReadonlyArray<string>>, key: string) => {
	//

	const loader = registry[key as keyof typeof registry];

	if (!loader) return undefined;

	const len = loader.length;
	const promises = [];

	for (let index = 0; index < len; index += 2) {
		// const path = loader[index];
		// const exportName = loader[index + 1];

		// if (!path || !exportName) continue;

		// biome-ignore lint/style/noNonNullAssertion: pairs are guaranteed to exist
		promises.push(import(loader[index]!).then((m) => m[loader[index + 1]!]));
	}

	const items = await Promise.all(promises);

	return items;
};

export { getDynamicOne };
export type { GetDynamicOne, GetDynamicOneParams };
