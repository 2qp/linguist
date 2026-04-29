import { join } from "@utils/join";

import type { ImportableType, SL } from "@/types/statement.types";

const exportBuilder = () => ({
	types: <const TStrict extends ImportableType[], const TLoose extends string[]>(...args: SL<TStrict, TLoose>) => ({
		from: <const TPaths extends string[]>(...paths: TPaths) => ({
			re_export: () => ({
				build: () => `export type { ${join([...args[0], ...args[1]], ", ")} } from "${join(paths, "")}";` as const,
			}),
		}),
	}),
});

export { exportBuilder };
