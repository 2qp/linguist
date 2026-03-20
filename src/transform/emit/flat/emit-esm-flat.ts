import { stringify } from "safe-stable-stringify";
import { normalizeName } from "@/transform/utils/normalize-name";
import { createStatementBuilder } from "@/transform/utils/statement/create-statement-builder";

import type { Languages } from "@/types/generated.types";
import type { Entries } from "@/types/utility.types";
import type { FlatEmitterType } from "./types";

const emitESMFlat: FlatEmitterType = ({ languages }) => {
	//

	const builder = createStatementBuilder();

	const esmEntries = (Object.entries(languages) as Entries<Languages>).map(([origName, data]) => {
		const norm = normalizeName(origName);

		const [var_stmt] = builder
			.var(norm.varName)
			.value(stringify(data, null, 2))
			.asConst()
			.build();

		return `export ${var_stmt}` as const;
	});

	const esmContent = esmEntries.join("\n\n");

	return esmContent;
};

export { emitESMFlat };
