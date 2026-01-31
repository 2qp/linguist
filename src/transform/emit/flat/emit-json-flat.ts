import stringify from "safe-stable-stringify";

import type { FlatEmitterType } from "./types";

const emitJSONFlat: FlatEmitterType = ({ languages }) => {
	//

	const content = stringify(languages, null, 2);

	const name = "all" as const;

	const statements = ([`const ${name} = ${content} as const;`, "\n\n", `export { ${name} };`, "\n\n"] as const).join(
		"",
	);

	return statements;
};

export { emitJSONFlat };
