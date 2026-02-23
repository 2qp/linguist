import { isNullish } from "@utils/guards";

import type { ExtractArrayElement } from "@/types/utility.types";

type BuildMapParams<T, Left, Right> = {
	source: T;
	left: Left;
	right: Right;
	// kPrimitive?: IsPrimitive;
	// vArray?: IsValueArray;
};

type BuildMapReturnType<
	T extends Record<string, unknown>,
	Left extends keyof T[keyof T],
	Right extends keyof T[keyof T],
	K extends keyof T,
> = Map<ExtractArrayElement<T[K][Left] & {}>, Set<T[K][Right]>> & {};

const buildMap = <
	T extends Record<string, unknown>,
	Left extends keyof T[keyof T],
	Right extends keyof T[keyof T],
	K extends keyof T,
>({
	source,
	left,
	right,
}: BuildMapParams<T, Left, Right>): BuildMapReturnType<T, Left, Right, K> => {
	//

	const map = new Map<ExtractArrayElement<T[K][Left] & {}>, Set<T[K][Right]> & {}>();

	for (const name of Object.keys(source) as K[]) {
		if (!name) continue;

		const language = source[name];
		if (!language) continue;

		const key = language[left];
		const value = language[right];

		if (isNullish(key)) continue;
		if (!Array.isArray(key)) continue;

		for (const item of key as T[K][Left][]) {
			//

			if (isNullish(item)) continue;

			const keyItem = item as ExtractArrayElement<T[K][Left] & {}>;

			const exist = map.get(keyItem);

			if (isNullish(exist)) {
				map.set(keyItem, new Set([value]));
			}

			map.set(keyItem, new Set(exist).add(value));
		}
	}

	return map;
};

export { buildMap };
export type { BuildMapParams };
