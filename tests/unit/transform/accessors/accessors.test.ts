import { T_INVALID } from "@tests/fixtures/constants/common";
import { by_extensions } from "@tests/fixtures/indexes/by-extensions.fixture";
import { by_name } from "@tests/fixtures/indexes/by-name.fixture";
import { dynamic_by_extensions } from "@tests/fixtures/indexes/dynamic-by-extensions.fixture";
import { dynamic_by_name } from "@tests/fixtures/indexes/dynamic-by-name.fixture";
import { lazy_by_extensions } from "@tests/fixtures/indexes/lazy-by-extensions.fixture";
import { lazy_by_name } from "@tests/fixtures/indexes/lazy-by-name.fixture";
import { _2_dimensional_array } from "@tests/fixtures/languages/data/2-dimensional-array";
import { public_key } from "@tests/fixtures/languages/data/public-key";
import { api_blueprint } from "@tests/fixtures/languages/markup/api-blueprint";
import { _1c_enterprise } from "@tests/fixtures/languages/programming/1c-enterprise";
import { ags_script } from "@tests/fixtures/languages/programming/ags-script";
import { aidl } from "@tests/fixtures/languages/programming/aidl";
import { kolmafia_ash } from "@tests/fixtures/languages/programming/kolmafia-ash";
import { asciidoc } from "@tests/fixtures/languages/prose/asciidoc";
import { describe, expect, it } from "vitest";
import { getLazyMany, getLazyOne } from "@/generated/getters";
import { getDynamicMany as getDynamicManyClient } from "@/transform/accessors/client/get-dynamic-many";
import { getDynamicOne as getDynamicOneClient } from "@/transform/accessors/client/get-dynamic-one";
import { getDynamicMany } from "@/transform/accessors/get-dynamic-many";
import { getDynamicOne } from "@/transform/accessors/get-dynamic-one";
import { getMany } from "@/transform/accessors/get-many";
import { getOne } from "@/transform/accessors/get-one";

describe("accessors", () => {
	//

	describe("get One", () => {
		//

		it("from record (1:1)", () => {
			const source = by_name;
			const result = getOne(source, "1C Enterprise");

			const expected = _1c_enterprise;

			expect(result).toEqual(expected);
		});

		it("from record (1:N)", () => {
			const source = by_extensions;
			const result = getOne(source, ".asc");

			const expected = [asciidoc, public_key, ags_script];

			expect(result).toEqual(expect.arrayContaining(expected));
		});

		it("from record (1:1) invalid key", () => {
			const source = by_name;
			const result = getOne(source, T_INVALID);

			const expected = undefined;

			expect(result).toEqual(expected);
		});

		it("from record (1:N) invalid key", () => {
			const source = by_extensions;
			const result = getOne(source, T_INVALID);

			const expected = undefined;

			expect(result).toEqual(expected);
		});
	});

	describe("get Many", () => {
		it("from record (1:1)", () => {
			const source = by_name;
			const result = getMany(source, ["1C Enterprise", "KoLmafia ASH"]);

			const expected = [_1c_enterprise, kolmafia_ash];

			expect(result).toEqual(expected);
		});

		it("from record (1:N)", () => {
			const source = by_extensions;
			const result = getMany(source, [".asc", ".ash"]);

			const expected = {
				asc: [ags_script, asciidoc, public_key],
				ash: [kolmafia_ash, ags_script],
			};

			expect(result).toEqual([expect.arrayContaining(expected.asc), expect.arrayContaining(expected.ash)]);
		});

		describe("from record (1:1) invalid key", () => {
			const source = by_name;

			it("mixed valid/invalid keys", () => {
				const result = getMany(source, ["1C Enterprise", T_INVALID], { keys: "hybrid" });
				const expected = [_1c_enterprise, undefined];
				expect(result).toEqual(expected);
			});

			it("all invalid keys", () => {
				const result_ = getMany(source, [T_INVALID, T_INVALID], { keys: "hybrid" });
				const expected_ = [undefined, undefined];
				expect(result_).toEqual(expected_);
			});
		});

		describe("from record (1:N) invalid key", () => {
			const source = by_extensions;

			it("mixed valid/invalid keys", () => {
				const result = getMany(source, [".ash", T_INVALID], { keys: "hybrid" });
				const expected = { ".ash": [ags_script, kolmafia_ash], T_INVALID: undefined };
				expect(result).toEqual([expect.arrayContaining(expected[".ash"]), expected.T_INVALID]);
			});

			it("all invalid keys", () => {
				const result = getMany(source, [T_INVALID, T_INVALID], { keys: "hybrid" });
				const expected = { ".ash": undefined, T_INVALID: undefined };
				expect(result).toEqual([expected[".ash"], expected.T_INVALID]);
			});
		});
	});

	//
	describe("get Lazy One", () => {
		it("from record (1:1)", async () => {
			const source = lazy_by_name;
			const result = await getLazyOne(source, "AIDL");

			const expected = aidl;

			expect(result).toEqual(expected);
		});

		it("from record (1:N)", async () => {
			const source = lazy_by_extensions;
			const result = await getLazyOne(source, ".ash");

			const expected = [kolmafia_ash, ags_script];

			expect(result).toEqual(expect.arrayContaining(expected));
		});

		it("from record (1:1) invalid key", async () => {
			const source = lazy_by_name;
			const result = await getLazyOne(source, T_INVALID);

			const expected = undefined;

			expect(result).toEqual(expected);
		});

		it("from record (1:N) invalid key", async () => {
			const source = lazy_by_extensions;
			const result = await getLazyOne(source, T_INVALID);

			const expected = undefined;

			expect(result).toEqual(expected);
		});
	});

	describe("get Lazy Many", () => {
		it("from record (1:1)", async () => {
			const source = lazy_by_name;
			const result = await getLazyMany(source, ["1C Enterprise", "KoLmafia ASH"]);

			const expected = [_1c_enterprise, kolmafia_ash];

			expect(result).toEqual(expected);
		});

		it("from record (1:N)", async () => {
			const source = lazy_by_extensions;
			const result = await getLazyMany(source, [".asc", ".ash"]);

			const expected = {
				asc: [ags_script, public_key, asciidoc],
				ash: [kolmafia_ash, ags_script],
			};

			expect(result).toEqual([expect.arrayContaining(expected.asc), expect.arrayContaining(expected.ash)]);
		});

		describe("from record (1:1) invalid key", () => {
			const source = lazy_by_name;

			it("mixed valid/invalid keys", async () => {
				const result = await getLazyMany(source, [T_INVALID, "1C Enterprise", "KoLmafia ASH"], { keys: "hybrid" });
				const expected = [undefined, _1c_enterprise, kolmafia_ash];
				expect(result).toEqual(expected);
			});

			it("all invalid keys", async () => {
				const result_ = await getLazyMany(source, [T_INVALID, T_INVALID], { keys: "hybrid" });
				const expected_ = [undefined, undefined];
				expect(result_).toEqual(expected_);
			});
		});

		describe("from record (1:N) invalid key", () => {
			const source = lazy_by_extensions;

			it("mixed valid/invalid keys", async () => {
				const result = await getLazyMany(source, [T_INVALID, ".asc", ".ash"], { keys: "hybrid" });

				const expected = {
					ash: [ags_script, kolmafia_ash],
					asc: [asciidoc, public_key, ags_script],
					T_INVALID: undefined,
				};

				expect(result).toEqual([
					expected.T_INVALID,
					expect.arrayContaining(expected.asc),
					expect.arrayContaining(expected.ash),
				]);
			});

			it("all invalid keys", async () => {
				const result = await getLazyMany(source, [T_INVALID, T_INVALID], { keys: "hybrid" });
				const expected = { ash: undefined, T_INVALID: undefined };
				expect(result).toEqual([expected.ash, expected.T_INVALID]);
			});
		});
	});

	//
	describe("get Dynamic One", () => {
		it("from record (1:1)", async () => {
			const source = dynamic_by_name;

			const result = await getDynamicOne(source, "2-Dimensional Array");

			const expected = [_2_dimensional_array];

			expect(result).toEqual(expected);

			//
		});

		it("from record (1:N)", async () => {
			const source = dynamic_by_extensions;

			const result = await getDynamicOne(source, ".ash");

			const expected = [kolmafia_ash, ags_script];

			expect(result).toEqual(expect.arrayContaining(expected));

			//
		});

		it("from record (1:1) invalid key", async () => {
			const source = dynamic_by_name;
			const result = await getDynamicOne(source, T_INVALID);

			const expected = [] as const;

			expect(result).toEqual(expected);
		});

		it("from record (1:N) invalid key", async () => {
			const source = dynamic_by_extensions;
			const result = await getDynamicOne(source, T_INVALID);

			const expected = [] as const;

			expect(result).toEqual(expected);
		});
	});

	describe("get Dynamic Many", () => {
		it("from record (1:1)", async () => {
			const source = dynamic_by_name;
			const result = await getDynamicMany(source, ["AsciiDoc", "AGS Script", "API Blueprint"]);

			const expected = [[asciidoc], [ags_script], [api_blueprint]];

			expect(result).toEqual(expected);
		});

		it("from record (1:N)", async () => {
			const source = dynamic_by_extensions;
			const result = await getDynamicMany(source, [".bsl", ".asc"]);

			const expected = {
				bsl: [_1c_enterprise],
				asc: [asciidoc, public_key, ags_script],
			};

			expect(result).toEqual([expect.arrayContaining(expected.bsl), expect.arrayContaining(expected.asc)]);
		});

		describe("from record (1:1) invalid key", () => {
			const source = dynamic_by_name;

			it("mixed valid/invalid keys", async () => {
				const result = await getDynamicMany(source, [T_INVALID, "1C Enterprise", "KoLmafia ASH"], { keys: "hybrid" });
				const expected = [[], [_1c_enterprise], [kolmafia_ash]];
				expect(result).toEqual(expected);
			});

			it("all invalid keys", async () => {
				const result_ = await getDynamicMany(source, [T_INVALID, T_INVALID], { keys: "hybrid" });
				const expected_ = [[], []];
				expect(result_).toEqual(expected_);
			});
		});

		describe("from record (1:N) invalid key", () => {
			const source = dynamic_by_extensions;

			it("mixed valid/invalid keys", async () => {
				const result = await getDynamicMany(source, [T_INVALID, ".asc", T_INVALID, ".ash"], { keys: "hybrid" });

				const expected = {
					ash: [ags_script, kolmafia_ash],
					asc: [asciidoc, public_key, ags_script],
					T_INVALID: [],
				};

				expect(result).toEqual([
					expected.T_INVALID,
					expect.arrayContaining(expected.asc),
					expected.T_INVALID,
					expect.arrayContaining(expected.ash),
				]);
			});

			it("all invalid keys", async () => {
				const result = await getDynamicMany(source, [T_INVALID, T_INVALID], { keys: "hybrid" });
				const expected = { ash: [], T_INVALID: [] };
				expect(result).toEqual([expected.ash, expected.T_INVALID]);
			});
		});
	});

	//
	describe("get Dynamic One - Client", () => {
		it("from record (1:1)", async () => {
			const source = dynamic_by_name;

			const result = await getDynamicOneClient(source, "AGS Script");

			const expected = [ags_script];

			expect(result).toEqual(expected);

			//
		});

		it("from record (1:N)", async () => {
			const source = dynamic_by_extensions;
			const result = await getDynamicOneClient(source, ".ash");

			const expected = [kolmafia_ash, ags_script];

			expect(result).toEqual(expect.arrayContaining(expected));
		});

		it("from record (1:1) invalid key", async () => {
			const source = dynamic_by_name;
			const result = await getDynamicOneClient(source, T_INVALID);

			const expected = [] as const;

			expect(result).toEqual(expected);
		});

		it("from record (1:N) invalid key", async () => {
			const source = dynamic_by_extensions;
			const result = await getDynamicOneClient(source, T_INVALID);

			const expected = [] as const;

			expect(result).toEqual(expected);
		});
	});

	describe("get Dynamic Many - Client", () => {
		it("from record (1:1)", async () => {
			const source = dynamic_by_name;
			const result = await getDynamicManyClient(source, ["1C Enterprise", "KoLmafia ASH"], { keys: "loose" });

			const expected = [[_1c_enterprise], [kolmafia_ash]];

			expect(result).toEqual(expected);
		});

		it("from record (1:N)", async () => {
			const source = dynamic_by_extensions;
			const result = await getDynamicManyClient(source, [".ash", ".asc"]);

			const expected = {
				bsl: [kolmafia_ash, ags_script],
				apib: [asciidoc, public_key, ags_script],
			};

			expect(result).toEqual([expect.arrayContaining(expected.bsl), expect.arrayContaining(expected.apib)]);
		});

		describe("from record (1:1) invalid key", () => {
			const source = dynamic_by_name;

			it("mixed valid/invalid keys", async () => {
				const result = await getDynamicManyClient(source, [T_INVALID, "1C Enterprise", "KoLmafia ASH"], {
					keys: "hybrid",
				});
				const expected = [[], [_1c_enterprise], [kolmafia_ash]];
				expect(result).toEqual(expected);
			});

			it("all invalid keys", async () => {
				const result_ = await getDynamicManyClient(source, [T_INVALID, T_INVALID], { keys: "hybrid" });
				const expected_ = [[], []];
				expect(result_).toEqual(expected_);
			});
		});

		describe("from record (1:N) invalid key", () => {
			const source = dynamic_by_extensions;

			it("mixed valid/invalid keys", async () => {
				const result = await getDynamicManyClient(source, [T_INVALID, ".asc", T_INVALID, ".ash"], { keys: "hybrid" });

				const expected = {
					ash: [ags_script, kolmafia_ash],
					asc: [asciidoc, public_key, ags_script],
					T_INVALID: [],
				};

				expect(result).toEqual([
					expected.T_INVALID,
					expect.arrayContaining(expected.asc),
					expected.T_INVALID,
					expect.arrayContaining(expected.ash),
				]);
			});

			it("all invalid keys", async () => {
				const result = await getDynamicManyClient(source, [T_INVALID, T_INVALID], { keys: "hybrid" });
				const expected = { ash: [], T_INVALID: [] };
				expect(result).toEqual([expected.ash, expected.T_INVALID]);
			});
		});
	});
});
