import { DYNAMIC_CDN } from "@/constants/urls";

import type { GetDynamicMany } from "../get-dynamic-many";

const getDynamicMany: GetDynamicMany = async (registry: Record<string, ReadonlyArray<string>>, keys: string[]) => {
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
			//

			const path = (loader[j] as unknown as string).slice(2);
			const url = `${DYNAMIC_CDN}/${path}` as const;

			// do not extract: causes extra chunking which breaks post-processing.
			const ignore = "IGNORE_WEBPACK" as const;

			// biome-ignore lint/style/noNonNullAssertion: pairs are guaranteed to exist
			target[p] = import(`${ignore}${url}`).then((m) => m[loader[j + 1]!]);
		}
	}

	return await Promise.all(promises.map((group) => Promise.all(group)));
};

export { getDynamicMany };
export type { GetDynamicMany };
