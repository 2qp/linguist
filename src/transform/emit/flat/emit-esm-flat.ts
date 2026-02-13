import { normalizeName } from "@/transform/utils/normalize-name";

import type { Languages } from "@/types/generated.types";
import type { Entries } from "@/types/utility.types";
import type { FlatEmitterType } from "./types";

const emitESMFlat: FlatEmitterType = ({ languages }) => {
	//

	const esmEntries = (Object.entries(languages) as Entries<Languages>).map(([origName, data]) => {
		const norm = normalizeName(origName);
		return `export const ${norm.varName} = ${JSON.stringify(data, null, 2)} as const;` as const;
	});

	const esmContent = `${esmEntries.join("\n\n")}\n` as const;

	return esmContent;
};

export { emitESMFlat };
