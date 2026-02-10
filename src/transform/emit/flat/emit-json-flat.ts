import stringify from "safe-stable-stringify";
import { createFallback } from "@/transform/utils/create-fallback";

import type { FlatEmitterType } from "./types";

const emitJSONFlat: FlatEmitterType = ({ languages, config }) => {
	//

	const content = stringify(languages, null, 2);

	const name = "all" as const;

	const fallback = createFallback({ config, name, falls: ["Language", "undefined"], types: ["Language"] });

	const statements = (
		[
			fallback.typeImports.join(""),
			`const _${fallback.norm.varName} = ${content} as const;`,
			"\n\n",
			fallback.varStatement,
			"\n\n",
			fallback.typeStatement,
			"\n\n",
			fallback.exportStatement.join(""),
		] as const
	).join("");

	return statements;
};

export { emitJSONFlat };
