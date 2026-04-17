import { isEmpty, isNullish } from "@utils/guards";

import type { ElementOf, KeysOfUnion, ValueFromUnion, ValueFromUnionByKey } from "@/types/utility.types";

type BuildVariant = "primitive" | "set" | "custom";

type ParamBase<TSource> = { source: TSource };

type Params<
	TSource,
	TVariant extends BuildVariant = BuildVariant,
	TLeft extends KeysOfUnion<TSource[keyof TSource]> = KeysOfUnion<TSource[keyof TSource]>,
	TRight extends KeysOfUnion<TSource[keyof TSource]> = KeysOfUnion<TSource[keyof TSource]>,
	TProperties extends KeysOfUnion<TSource[keyof TSource]>[] = KeysOfUnion<TSource[keyof TSource]>[],
> = TVariant extends "set"
	? { kind: TVariant; left: TLeft; right: TRight }
	: TVariant extends "custom"
		? { kind: TVariant; left: TLeft; properties: TProperties }
		: TVariant extends "primitive"
			? { kind?: TVariant; key: TLeft; value: TRight }
			: undefined;

type BuildReturn<
	TSource extends Record<string, unknown>,
	K extends keyof TSource,
	TLeft extends KeysOfUnion<TSource[keyof TSource]>,
	TRight extends KeysOfUnion<TSource[keyof TSource]>,
	TProperties extends KeysOfUnion<TSource[keyof TSource]>[],
	TVariant extends BuildVariant,
> = TVariant extends "set"
	? Map<ElementOf<TSource[K][TLeft]>, Set<TSource[K][TRight]>>
	: TVariant extends "custom"
		? Map<ElementOf<TSource[K][TLeft]>, { [Key in TProperties[number]]: ValueFromUnion<TSource[K], Key> }[]>
		: TVariant extends "primitive"
			? Map<ElementOf<TSource[K][TLeft]>, ValueFromUnionByKey<TSource[keyof TSource], TRight>>
			: undefined;

const buildMap = <
	const TSource extends Record<string, unknown>,
	const K extends keyof TSource,
	const TLeft extends KeysOfUnion<TSource[keyof TSource]>,
	const TRight extends KeysOfUnion<TSource[keyof TSource]>,
	const TProperties extends KeysOfUnion<TSource[keyof TSource]>[],
	const TVariant extends BuildVariant,
>(
	params: Params<TSource, TVariant, TLeft, TRight, TProperties> & ParamBase<TSource>,
): BuildReturn<TSource, K, TLeft, TRight, TProperties, TVariant> => {
	//

	if (params.kind === "set") {
		//
		const source = params.source;
		const left = params.left;
		const right = params.right;

		const map = new Map<ElementOf<TSource[K][TLeft]>, Set<TSource[K][TRight]>>();

		for (const name of Object.keys(source) as K[]) {
			if (!name) continue;

			const language = source[name];
			if (!language) continue;

			const key = language[left];
			const value = language[right];

			if (isNullish(key)) continue;
			// if (!Array.isArray(key)) continue;

			const keys = Array.isArray(key) ? key : [key];

			for (const item of keys as TSource[K][TLeft][]) {
				//

				if (isNullish(item)) continue;

				const keyItem = item as ElementOf<TSource[K][TLeft]>;
				const exist = map.get(keyItem);

				if (isNullish(exist)) {
					//

					if (isNullish(value)) {
						map.set(keyItem, new Set([]));
						continue;
					}

					map.set(keyItem, new Set([value]));
					continue;
				}

				if (isNullish(value)) {
					map.set(keyItem, new Set(exist));
					continue;
				}

				map.set(keyItem, new Set(exist).add(value));
			}
		}
		return map as BuildReturn<TSource, K, TLeft, TRight, TProperties, TVariant>;
	}

	if (params.kind === "custom") {
		//
		const source = params.source;
		const left = params.left;
		const props = params.properties;

		const map = new Map<
			ElementOf<TSource[K][TLeft]>,
			{ [Key in TProperties[number]]: ValueFromUnion<TSource[K], Key> }[]
		>();

		for (const name of Object.keys(source) as K[]) {
			if (!name) continue;

			const language = source[name];
			if (!language) continue;

			const key = language[left];

			const valueMap = props.map((key) => [key, language[key]]).filter(([_, value]) => value != null);

			const value = Object.fromEntries(valueMap);

			const isValueEmpty = isNullish(value) || isEmpty(value);

			if (isNullish(key)) continue;
			if (isValueEmpty) continue;

			if (!Array.isArray(key)) {
				map.set(key as ElementOf<TSource[K][TLeft]>, value);
				continue;
			}

			for (const item of key as TSource[K][TLeft][]) {
				//

				if (isNullish(item)) continue;

				const keyItem = item as ElementOf<TSource[K][TLeft]>;

				const exist = map.get(keyItem);

				if (isNullish(exist)) {
					//

					if (isValueEmpty) {
						map.set(keyItem, []);
						continue;
					}

					map.set(keyItem, [value]);
					continue;
				}

				if (isValueEmpty) {
					map.set(keyItem, exist);
					continue;
				}

				map.set(keyItem, exist.concat(value));
			}
		}
		return map as BuildReturn<TSource, K, TLeft, TRight, TProperties, TVariant>;
	}

	if (params.kind === "primitive") {
		const source = params.source;
		const left = params.key;
		const right = params.value;

		const map = new Map<ElementOf<TSource[K][TLeft]>, TSource[K][TRight]>();

		for (const name of Object.keys(source) as K[]) {
			if (!name) continue;

			const language = source[name];
			if (!language) continue;

			const key = language[left];
			const value = language[right];

			if (isNullish(key)) continue;
			if (isNullish(value)) continue;
			if (Array.isArray(key)) continue;

			map.set(key as ElementOf<TSource[K][TLeft]>, value);
		}
		return map as BuildReturn<TSource, K, TLeft, TRight, TProperties, TVariant>;
	}

	return undefined as BuildReturn<TSource, K, TLeft, TRight, TProperties, TVariant>;
};

export { buildMap };
export type { BuildVariant, Params as BuildParams };
