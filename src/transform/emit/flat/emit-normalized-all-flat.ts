import stringify from "safe-stable-stringify";
import { normalizeName } from "@/transform/utils/normalize-name";

import type { Language, LanguageName } from "@/generated/types";
import type { FlatEmitterType } from "./types";

const emitNormalizedAllFlat: FlatEmitterType = ({ languages }) => {
	//

	const normalized: Record<string, Language> = {};
	const seenKeys = new Set<string>();

	const keys = Object.keys(languages) as LanguageName[];

	for (let i = 0; i < keys.length; i++) {
		//

		const key = keys[i];
		if (!key) continue;

		const normKey = normalizeName(key);

		const normalizedKey = normKey.varName;

		if (seenKeys.has(normalizedKey)) {
			throw new Error(`key collision detected: "${normalizedKey}"`);
		}

		const value = languages[key];
		if (!value) continue;

		seenKeys.add(normalizedKey);
		normalized[normalizedKey] = value;
	}

	const content = stringify(normalized, null, 2);

	const name = "normalizedAll" as const;

	const statements = ([`const ${name} = ${content} as const;`, "\n\n", `export { ${name} };`, "\n\n"] as const).join(
		"",
	);

	return statements;
};

export { emitNormalizedAllFlat };
