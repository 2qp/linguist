import type { OptionalBrand } from "@/types/branded.types";
import type { ExtractExplicit } from "@/types/utility.types";

type GetDynamicManyParams = {};

type KeyMode = "known" | "loose" | "hybrid";

type DynamicLookupOptions<M extends KeyMode> = {
	/** `"known" | "hybrid"` */
	keys?: M;
};

type ExtractPayloadsAsTuple<T, K extends readonly (keyof T)[]> = {
	[I in keyof K]: K[I] extends keyof T ? (T[K[I]] extends OptionalBrand<unknown, infer U> ? U : never) : never;
};

type GetDynamicManyOverloaded = {
	<const I extends Record<string, unknown>, const T extends ReadonlyArray<keyof ExtractExplicit<I>>>(
		registry: I,
		keys: T,
		options?: DynamicLookupOptions<"known">,
	): Promise<ExtractPayloadsAsTuple<I, T>>;

	<const I extends Record<string, unknown>, T extends ReadonlyArray<string>>(
		registry: I,
		keys: T,
		options: DynamicLookupOptions<"hybrid">,
	): Promise<ExtractPayloadsAsTuple<I, T>>;
};

type GetDynamicMany = GetDynamicManyOverloaded;

const getDynamicMany: GetDynamicMany = async (registry: Record<string, ReadonlyArray<string>>, keys: string[]) => {
	//

	const length = keys.length;

	const promises: unknown[][] = [];
	const result = [];

	for (let i = 0; i < length; i++) {
		//

		promises[i] = [];

		const key = keys[i];
		if (!key) continue;

		const loader = registry[key as keyof typeof registry];
		if (!loader) continue;

		const len = loader?.length;

		for (let j = 0; j < len; j += 2) {
			// biome-ignore lint/style/noNonNullAssertion: pairs are guaranteed to exist
			promises[i]![j / 2] = import(loader[j]!).then((m) => m[loader[j + 1]!]);
		}
	}

	for (let i = 0; i < promises.length; i++) {
		// biome-ignore lint/style/noNonNullAssertion: <pairs are guaranteed to exist>
		result[i] = await Promise.all(promises[i]!);
	}

	return result;
};

export { getDynamicMany };
export type { DynamicLookupOptions, GetDynamicMany, GetDynamicManyParams };
