import { NAME_TO_NORMALIZED_FIXTURE, NAMES_FIXTURE } from "@tests/fixtures/normalized-name.fixture";
import { describe, expect, it } from "vitest";
import { normalizeName } from "@/transform/utils/normalize-name";

describe("normalize-name", async () => {
	///

	const names = NAMES_FIXTURE;

	const source = NAME_TO_NORMALIZED_FIXTURE;

	describe("correctly normalizes", () => {
		//

		for (const name of names) {
			//

			it(name, async () => {
				//

				const result = normalizeName(name);

				const expected = source[name];

				expect(result).toStrictEqual(expected);
			});
		}
	});
});
