import { DYNAMIC_CDN } from "@/constants/urls";

import type { GetDynamicOne } from "../get-dynamic-one";

const getDynamicOne: GetDynamicOne = async (registry: Record<string, ReadonlyArray<string>>, key: string) => {
	//

	const loader = registry[key as keyof typeof registry];

	if (!loader) return undefined;

	const len = loader.length;
	const promises = new Array(len >> 1);

	for (let index = 0, p = 0; index < len; index += 2, p++) {
		// const path = loader[index];
		// const exportName = loader[index + 1];

		// if (!path || !exportName) continue;

		const path = (loader[index] as unknown as string).slice(2);
		const url = `${DYNAMIC_CDN}/${path}` as const;

		// do not extract: causes extra chunking which breaks post-processing.
		const ignore = "IGNORE_WEBPACK" as const;

		// biome-ignore lint/style/noNonNullAssertion: pairs are guaranteed to exist
		promises[p] = import(`${ignore}${url}`).then((m) => m[loader[index + 1]!]);
	}

	const items = await Promise.all(promises);

	return items;
};

export { getDynamicOne };
