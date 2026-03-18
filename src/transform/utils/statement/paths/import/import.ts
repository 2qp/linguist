import { join } from "@utils/join";

import type { Primitive } from "@/types/gen.types";
import type { ImportableType, SL } from "@/types/statement.types";

const importBuilder = () => ({
	types: <const TStrict extends ImportableType[], const TLoose extends string[]>(...args: SL<TStrict, TLoose>) => ({
		from: <const TPaths extends string[]>(...paths: TPaths) => ({
			build: () => `import type { ${join([...args[0], ...args[1]], ", ")} } from "${join(paths, "")}";` as const,
		}),
	}),

	values: <const TValues extends string[]>(values: TValues) => ({
		from: <const TPaths extends string[]>(...paths: TPaths) => ({
			build: () => `import { ${join(values, ", ")} } from "${join(paths, "")}";` as const,
		}),
	}),

	lazy: () => ({
		values: () => ({
			from: <const TPaths extends string[]>(paths: TPaths) => ({
				then_: <const TThen extends Primitive>(then: TThen) => ({
					build: () => `import('${join(paths, "")}').then(({ ${then} }) => ${then})` as const,
				}),
			}),
		}),
	}),
});

export { importBuilder };
