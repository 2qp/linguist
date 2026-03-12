import { join } from "@utils/join";

import type { ToString } from "@/types/gen.types";
import type { From, ImportableType, SL } from "@/types/statement.types";

const importBuilder = () => ({
	types: <const TStrict extends ImportableType[], const TLoose extends string[]>(...args: SL<TStrict, TLoose>) => ({
		from: <const TPaths, const TPath extends keyof TPaths>(...[paths, path]: From<TPaths, TPath>) => ({
			build: () =>
				`import type { ${join([...args[0], ...args[1]], ", ")} } from "${paths[path] as ToString<TPaths[TPath]>}";` as const,
		}),
	}),

	values: <const TValues extends string[]>(values: TValues) => ({
		from: <const TPaths, const TPath extends keyof TPaths>(...[paths, path]: From<TPaths, TPath>) => ({
			build: () => `import { ${join(values, ", ")} } from "${paths[path] as ToString<TPaths[TPath]>}";` as const,
		}),
	}),
});

export { importBuilder };
