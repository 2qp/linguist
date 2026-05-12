import type { ManyOptions } from "@/types/accessors.types";
import type { OptionalBrand } from "@/types/branded.types";
import type { ExplicitKeys } from "@/types/utility.types";

type GetDynamicManyParams = {};

type ExtractPayloadsAsTuple<T, K extends readonly (keyof T)[]> = {
	[I in keyof K]: K[I] extends keyof T ? (T[K[I]] extends OptionalBrand<unknown, infer U> ? U : never) : never;
};

type ExtractBrand<T> = T extends OptionalBrand<unknown, infer B> ? B : never;

type GetDynamicManyOverloaded = {
	<const I extends Record<string, unknown>, const T extends ExplicitKeys<I>>(
		registry: I,
		keys: T,
		options?: ManyOptions<"known">,
	): Promise<ExtractPayloadsAsTuple<I, T>>;

	<const I extends Record<string, unknown>, const T extends readonly string[], E extends ExplicitKeys<I>>(
		registry: I,
		keys: T | E,
		options: ManyOptions<"hybrid">,
	): Promise<ExtractPayloadsAsTuple<I, T>>;

	<const I extends Record<string, unknown>, const T extends readonly string[], E extends ExplicitKeys<I>>(
		registry: I,
		keys: T | E,
		options: ManyOptions<"loose">,
	): Promise<readonly ExtractBrand<I[string]>[]>;
};

type GetDynamicMany = GetDynamicManyOverloaded;

const getDynamicMany: GetDynamicMany = async (registry: Record<string, readonly string[]>, keys: string[]) => {
	//

	const length = keys.length;

	const promises: unknown[][] = new Array(length);

	for (let i = 0; i < length; i++) {
		//

		promises[i] = [];

		const key = keys[i];
		if (!key) continue;

		const loader = registry[key as keyof typeof registry];
		if (!loader) continue;

		const len = loader?.length;

		// biome-ignore lint/style/noNonNullAssertion: pairs are guaranteed to exist
		const target = promises[i]!;

		for (let j = 0, p = 0; j < len; j += 2, p++) {
			// biome-ignore lint/style/noNonNullAssertion: pairs are guaranteed to exist
			target[p] = import(loader[j]!).then((m) => m[loader[j + 1]!]);
		}
	}

	return await Promise.all(promises.map((group) => Promise.all(group)));
};

export { getDynamicMany };
export type { GetDynamicMany, GetDynamicManyParams };
