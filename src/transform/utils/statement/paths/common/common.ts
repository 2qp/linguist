import { getWrapped } from "../../statement-builder-utils";

import type { Primitive } from "@/types/gen.types";
import type { Wrapper } from "@/types/statement.types";

const commonBuilder = () => ({
	//

	record: () => ({
		key: <const TKey extends Primitive>(key: TKey) => ({
			value: <const TValue extends Primitive>(value: TValue) => ({
				build: () => `"${key}": ${value},` as const,
			}),

			wrap: <const TWrapper extends Wrapper>(wrapper: TWrapper) => ({
				value: <const TValue extends string[]>(value: TValue) => ({
					build: () => `"${key}": ${getWrapped(value, wrapper)},` as const,
				}),
			}),
		}),
	}),

	tuple: () => ({
		key: <const TKey extends Primitive>(key: TKey) => ({
			value: <const TValue extends Primitive>(value: TValue) => ({
				build: () => [key, value] as const,

				trailing: <const TTrailing extends unknown[]>(...args: TTrailing) => ({
					build: () => [key, value, ...args] as const,
				}),
			}),

			wrap: <const TWrapper extends Wrapper>(wrapper: TWrapper) => ({
				value: <const TValue extends string[]>(value: TValue) => ({
					build: () => [key, getWrapped(value, wrapper)] as const,

					trailing: <const TTrailing extends unknown[]>(...args: TTrailing) => ({
						build: () => [key, getWrapped(value, wrapper), ...args] as const,
					}),
				}),
			}),
		}),
	}),
});

export { commonBuilder };
