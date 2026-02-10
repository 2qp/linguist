import stringify from "safe-stable-stringify";
import { createFallback } from "@/transform/utils/create-fallback";
import { normalizeName } from "@/transform/utils/normalize-name";

import type { Language, LanguageName } from "@/generated/types";
import type { FlatEmitterType } from "./types";

const emitNormalizedAllFlat: FlatEmitterType = ({ config, languages }) => {
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

		const nameAttachedValue = { ...value, name: key };

		seenKeys.add(normalizedKey);
		normalized[normalizedKey] = nameAttachedValue;
	}

	const content = stringify(normalized, null, 2);

	const name = "normalized All" as const;

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

export { emitNormalizedAllFlat };
