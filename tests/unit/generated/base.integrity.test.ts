//@ts-nocheck

import { describe, expect, it } from "vitest";
import { all } from "@/generated/data/flat/all";
import { language_id_to_name } from "@/generated/data/maps/language-id-to-name";

describe("language maps data integrity", () => {
	//

	const languages = Object.keys(all).map((name) => all[name]);

	it("all ids are unique", () => {
		//

		const ids = languages.map((l) => l?.language_id);

		expect(new Set(ids).size).toEqual(ids.length);
	});

	it("all ids map back to correct name", () => {
		for (const lang of languages) {
			if (!lang) throw new Error("missing language entry");

			expect(language_id_to_name?.[lang.language_id], `Failed on language_id: ${lang.language_id}`).toEqual(lang.name);
		}
	});
});
