import stringify from "safe-stable-stringify";
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

	const manualTypeImports = [
		`import type { Language, FallbackForUnknownKeys } from "${config.type.aliases.outputDir}/${config.type.out.fileNameNoExt}"` as const,
	].join("\n");

	const name = "normalizedAll" as const;
	const typeName = "NormalizedAll" as const;

	const statements = (
		[
			manualTypeImports,
			"\n\n",
			`const _${name} = ${content} as const;`,
			"\n\n",
			`const ${name}: typeof _${name} & FallbackForUnknownKeys<Language | undefined> = _${name};`,
			"\n\n",
			`type ${typeName} = typeof ${name};`,
			"\n\n",
			`export { ${name} };`,
			"\n",
			`export type { ${typeName} };`,
		] as const
	).join("");

	return statements;
};

export { emitNormalizedAllFlat };
