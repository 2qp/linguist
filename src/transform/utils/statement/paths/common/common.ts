import { join } from "@utils/join";
import { joinSimple } from "@utils/join-simple";
import { getWrapped, wrap, wrapTupleReversed } from "@/transform/utils/statement/statement-builder-utils";

import type { Primitive } from "@/types/gen.types";
import type { Separator, Wrapper } from "@/types/statement.types";

const commonBuilder = () => ({
	//

	record: () => ({
		key: <const TKey extends Primitive>(key: TKey) => ({
			value: <const TValue extends Primitive>(value: TValue) => ({
				build: () => `"${key}": ${value},` as const,
			}),

			wrap: <const TWrapper extends Wrapper, const TSeparator extends Separator = ", ">(
				wrapper: TWrapper,
				separator: TSeparator = ", " as TSeparator,
			) => ({
				value: <const TValue extends string>(value: TValue) => ({
					build: () => `"${key}": ${getWrapped([value], wrapper, separator)},` as const,
				}),

				value_: () => {
					//

					const builder = <
						const T extends string,
						const W extends Wrapper,
						const A extends readonly (readonly [T, W])[],
					>(
						children: A = [] as unknown as A,
					) => ({
						//

						add: <const CT extends string, const CW extends W>(content: readonly [CT, CW]) =>
							builder([content, ...children] as const),

						suffix: <const TSuffix extends string = ",">(suffix: TSuffix = "," as TSuffix) => ({
							build: () =>
								`"${key}": ${wrap(joinSimple(wrapTupleReversed([...children] as const), separator), wrapper)}${suffix}` as const,
						}),

						build: () =>
							`"${key}": ${wrap(joinSimple(wrapTupleReversed([...children] as const), separator), wrapper)},` as const,
					});

					return builder();
				},

				values: <const TValue extends string[]>(value: TValue) => ({
					build: () => `"${key}": ${getWrapped(value, wrapper, separator)},` as const,
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

			wrap: <const TWrapper extends Wrapper, const TSeparator extends Separator = ", ">(
				wrapper: TWrapper,
				separator: TSeparator = ", " as TSeparator,
			) => ({
				value: <const TValue extends string>(value: TValue) => ({
					build: () => [key, getWrapped([value], wrapper, separator)] as const,

					trailing: <const TTrailing extends unknown[]>(...args: TTrailing) => ({
						build: () => [key, getWrapped([value], wrapper, separator), ...args] as const,
					}),
				}),

				values: <const TValue extends string[]>(value: TValue) => ({
					build: () => [key, getWrapped(value, wrapper, separator)] as const,

					trailing: <const TTrailing extends unknown[]>(...args: TTrailing) => ({
						build: () => [key, getWrapped(value, wrapper, separator), ...args] as const,
					}),
				}),
			}),
		}),
	}),

	path: () => ({
		from: <const TPaths extends string[]>(...paths: TPaths) => ({ build: () => `\`${join(paths, "")}\`` as const }),
	}),
});

export { commonBuilder };
