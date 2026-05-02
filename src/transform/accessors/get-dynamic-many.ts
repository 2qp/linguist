import type { OptionalBrand } from "@/types/branded.types";
import type { ExtractExplicit } from "@/types/utility.types";

type GetDynamicManyParams = {};

type ExtractPayloadsAsTuple<T, K extends readonly (keyof T)[]> = {
	[I in keyof K]: K[I] extends keyof T ? (T[K[I]] extends OptionalBrand<unknown, infer U> ? U : never) : never;
};

type GetDynamicManyOverloaded = {
	<const I extends Record<string, unknown>, const T extends readonly (keyof ExtractExplicit<I>)[]>(
		registry: I,
		keys: T,
		strict?: true,
	): Promise<ExtractPayloadsAsTuple<I, T>>;

	<const I extends Record<string, unknown>, T extends string[]>(
		registry: I,
		keys: T,
		strict: false,
	): Promise<ExtractPayloadsAsTuple<I, T>>;
};

type GetDynamicMany = GetDynamicManyOverloaded;

const getDynamicMany: GetDynamicMany = async (registry: Record<string, ReadonlyArray<string>>, keys: string[]) => {
	//

	const promises: unknown[] = [];
	const length = keys.length;

	for (let index = 0; index < length; index++) {
		//

		const key = keys[index];
		if (!key) continue;

		const loader = registry[key as keyof typeof registry];
		if (!loader) continue;

		const len = loader?.length;

		for (let index = 0; index < len; index += 2) {
			//

			// biome-ignore lint/style/noNonNullAssertion: pairs are guaranteed to exist
			promises.push(import(loader[index]!).then((m) => m[loader[index + 1]!]));
		}
	}

	return await Promise.all(promises);
};

export { getDynamicMany };
export type { GetDynamicMany, GetDynamicManyParams };
