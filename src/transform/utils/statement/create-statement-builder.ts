import { join } from "@utils/join";

type CreateStatementBuilderParams = {};

type CreateStatementBuilder = (params?: CreateStatementBuilderParams) => void;

const createStatementBuilder = () => {
	//

	const builder = {
		//

		import: () => ({
			types: <const TTypes extends string[]>(types: TTypes) => ({
				from: <const TPath extends string>(path: TPath) =>
					`import type { ${join(types, ", ")} } from "${path}";` as const,
			}),

			values: <const TTypes extends string[]>(types: TTypes) => ({
				from: <const TPath extends string>(path: TPath) => `import { ${join(types, ", ")} } from "${path}";` as const,
			}),
		}),
	};

	return builder;
};

export { createStatementBuilder };
export type { CreateStatementBuilderParams, CreateStatementBuilder };
