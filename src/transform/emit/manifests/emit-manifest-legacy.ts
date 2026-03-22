import { isNullish } from "@utils/guards";

import type { Language, LanguageName, Languages } from "@/types/generated.types";
import type { Entries } from "@/types/utility.types";

type EmitManifestConfig =
	| {
			data: keyof Language;
			key: keyof Language | "name";
			set: keyof Language | "name";

			isCustom?: false;
	  }
	| {
			data: keyof Language;
			key: keyof Language | "name";
			set: keyof Language | "name";

			isCustom: true;
			custom: Partial<{ [key in keyof Language | "name" | (string & {})]: keyof Language | "name" }>;
	  };

type EmitManifestParams = { languages: Languages | Readonly<Languages>; config: EmitManifestConfig };

type EmitManifestType = (params: EmitManifestParams) => Map<unknown, unknown> | undefined;

/**
 * @deprecated
 */
const emitManifest: EmitManifestType = ({ config, languages }) => {
	//

	// will do more narrowing later..
	// in `EmitManifestConfig` some keys should be optional, depends on the output structure..

	// tried to do `key` discriminated via `data: keyof Language`..
	// having issues with extending `Language[data]` to see whether its an array or not; due to (readonly ((string & {}) | literals)[]

	const map = new Map<unknown, unknown | Set<unknown>>();

	for (const languageName of Object.keys(languages) as LanguageName[]) {
		if (!languageName) continue;

		const languageData = languages[languageName];

		const key = config.key === "name" ? languageName : languageData?.[config.key];
		const set = config.set === "name" ? languageName : languageData?.[config.set];
		const data = languageData?.[config.data];

		const createCustom = (): Record<string, string | undefined> | undefined => {
			if (!config.isCustom) return;
			if (!config.custom) return;

			const result = (Object.entries(config.custom) as Entries<typeof config.custom>)
				.filter((item): item is [string, keyof Language | "name"] => item?.[0] !== undefined && item?.[1] !== undefined)
				.map(([que, val]) => [que, val === "name" ? languageName : languageData?.[val]]);

			return Object.fromEntries(result);
		};

		const payload = config.isCustom ? createCustom() : data;

		if (isNullish(data)) continue;

		if (!Array.isArray(data) || config.isCustom) {
			map.set(key, payload);
			continue;
		}

		for (const extension of data) {
			const exist = map.get(extension);
			if (isNullish(exist)) {
				map.set(extension, new Set([set]));
				continue;
			}

			if (exist instanceof Set) map.set(extension, new Set(exist).add(set));
		}
	}

	return map;
};

export { emitManifest };
export type { EmitManifestConfig, EmitManifestParams, EmitManifestType };
