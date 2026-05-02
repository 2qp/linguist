import { DYNAMIC_CDN } from "@/constants/urls";

import type { GetDynamicMany } from "../get-dynamic-many";

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

			const path = (loader[index] as unknown as string).slice(2);
			const url = `${DYNAMIC_CDN}/${path}`;

			const ignore = "IGNORE_WEBPACK";

			// biome-ignore lint/style/noNonNullAssertion: pairs are guaranteed to exist
			promises.push(import(`${ignore}${url}`).then((m) => m[loader[index + 1]!]));
		}
	}

	return await Promise.all(promises);
};

export { getDynamicMany };
export type { GetDynamicMany };
