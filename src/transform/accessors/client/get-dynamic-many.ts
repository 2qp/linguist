import { DYNAMIC_CDN } from "@/constants/urls";

import type { GetDynamicMany } from "../get-dynamic-many";

const getDynamicMany: GetDynamicMany = async (registry: Record<string, ReadonlyArray<string>>, keys: string[]) => {
	//

	const promises: unknown[][] = [];

	const length = keys.length;

	for (let i = 0; i < length; i++) {
		//

		promises[i] = [];

		const key = keys[i];
		if (!key) continue;

		const loader = registry[key as keyof typeof registry];
		if (!loader) continue;

		const len = loader?.length;

		for (let j = 0; j < len; j += 2) {
			//

			const path = (loader[j] as unknown as string).slice(2);
			const url = `${DYNAMIC_CDN}/${path}`;

			const ignore = "IGNORE_WEBPACK";

			// biome-ignore lint/style/noNonNullAssertion: pairs are guaranteed to exist
			promises[i]![j / 2] = import(`${ignore}${url}`).then((m) => m[loader[j + 1]!]);
		}
	}

	return await Promise.all(promises.map((group) => Promise.all(group)));
};

export { getDynamicMany };
export type { GetDynamicMany };
