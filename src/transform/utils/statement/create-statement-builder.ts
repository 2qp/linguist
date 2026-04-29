import { commonBuilder } from "./paths/common/common";
import { exportBuilder } from "./paths/export/export";
import { importBuilder } from "./paths/import/import";
import { typeBuilder } from "./paths/type/type";
import { varBuilder } from "./paths/var/var";

type CreateStatementBuilderParams = {};

type CreateStatementBuilder = (params?: CreateStatementBuilderParams) => void;

// why path walking instead of flatten (with recursion)
// recursion of generics casued ts(7056), if declared more than 1 spread tuple generics.
// so annotation is a must. but gets messy trying to achieve literal infererabce
// build is full of conditional types
// so either classes or path walking

const createStatementBuilder = () => {
	//

	const builder = {
		//

		import: importBuilder,

		export: exportBuilder,

		var: varBuilder,

		type: typeBuilder,

		common: commonBuilder,
	};

	return builder;
};

export { createStatementBuilder };
export type { CreateStatementBuilder, CreateStatementBuilderParams };
