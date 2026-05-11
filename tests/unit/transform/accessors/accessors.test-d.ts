import { T_DYNAMIC_S, T_INVALID } from "@tests/fixtures/constants/common";
import { by_extensions } from "@tests/fixtures/indexes/by-extensions.fixture";
import { by_name } from "@tests/fixtures/indexes/by-name.fixture";
import { dynamic_by_extensions } from "@tests/fixtures/indexes/dynamic-by-extensions.fixture";
import { dynamic_by_name } from "@tests/fixtures/indexes/dynamic-by-name.fixture";
import { lazy_by_extensions } from "@tests/fixtures/indexes/lazy-by-extensions.fixture";
import { lazy_by_name } from "@tests/fixtures/indexes/lazy-by-name.fixture";
import { describe, expectTypeOf, it } from "vitest";
import { getDynamicMany as getDynamicManyClient } from "@/transform/accessors/client/get-dynamic-many";
import { getDynamicOne as getDynamicOneClient } from "@/transform/accessors/client/get-dynamic-one";
import { getDynamicMany } from "@/transform/accessors/get-dynamic-many";
import { getDynamicOne } from "@/transform/accessors/get-dynamic-one";
import { getLazyMany } from "@/transform/accessors/get-lazy-many";
import { getLazyOne } from "@/transform/accessors/get-lazy-one";
import { getMany } from "@/transform/accessors/get-many";
import { getOne } from "@/transform/accessors/get-one";

import type { _2DimensionalArray } from "@tests/fixtures/languages/data/2-dimensional-array";
import type { PublicKey } from "@tests/fixtures/languages/data/public-key";
import type { APIBlueprint } from "@tests/fixtures/languages/markup/api-blueprint";
import type { _1CEnterprise } from "@tests/fixtures/languages/programming/1c-enterprise";
import type { AGSScript } from "@tests/fixtures/languages/programming/ags-script";
import type { AIDL } from "@tests/fixtures/languages/programming/aidl";
import type { KoLmafiaASH } from "@tests/fixtures/languages/programming/kolmafia-ash";
import type { AsciiDoc } from "@tests/fixtures/languages/prose/asciidoc";
import type { Language } from "@tests/fixtures/types/language-types.generated";
import type { DeepReadonlyArray, ElementArraysOf } from "@/types/utility.types";

describe("accessors-types", () => {
	//

	describe("get One", () => {
		//

		it("from record (1:1)", () => {
			const source = by_name;
			const result = getOne(source, "1C Enterprise");

			type Actual = typeof result;

			type Expected = _1CEnterprise;

			expectTypeOf<Actual>().toEqualTypeOf<Expected>();
		});

		it("from record (1:N)", () => {
			const source = by_extensions;
			const result = getOne(source, ".asc");

			type Actual = typeof result;
			type Actual_ = readonly Actual[number][];

			type Expected = readonly [AsciiDoc, PublicKey, AGSScript][number][];

			expectTypeOf<Actual>().toExtend<Expected>();
			expectTypeOf<Expected>().toExtend<Actual_>();
		});

		it("from record (1:1) with `known` variant", () => {
			const source = by_name;

			const result = getOne(source, "AIDL", { key: "known" });

			type Actual = typeof result;

			type Expected = AIDL;

			expectTypeOf<Actual>().toEqualTypeOf<Expected>();
		});

		it("from record (1:N) with `known` variant", () => {
			const source = by_extensions;

			const result = getOne(source, ".bsl", { key: "known" });

			type Actual = typeof result;
			type Actual_ = readonly Actual[number][];

			// inner arrays element positions may change
			type Expected = readonly [_1CEnterprise][number][];

			expectTypeOf<Actual>().toExtend<Expected>();
			expectTypeOf<Expected>().toExtend<Actual_>();
		});
	});

	describe("get Many", () => {
		it("from record (1:1)", () => {
			const source = by_name;
			const result = getMany(source, ["1C Enterprise", "KoLmafia ASH"]);

			type Actual = typeof result;

			type Expected = readonly [_1CEnterprise, KoLmafiaASH];

			expectTypeOf<Actual>().toEqualTypeOf<Expected>();
		});

		it("from record (1:N)", () => {
			const source = by_extensions;
			const result = getMany(source, [".asc", ".ash"]);

			type Actual = typeof result;
			type Actual_ = ElementArraysOf<Actual>;

			type Expected = [[AGSScript, PublicKey, AsciiDoc], [AGSScript, KoLmafiaASH]];
			type Expected_ = ElementArraysOf<DeepReadonlyArray<Expected>>;

			expectTypeOf<Actual>().toExtend<Expected_>();
			expectTypeOf<Expected_>().toExtend<Actual_>();
		});

		it("from record (1:1) with `hybrid` variant", () => {
			const source = by_name;

			const result = getMany(source, ["AIDL", T_INVALID, "Public Key"], { keys: "hybrid" });

			type Actual = typeof result;

			type Expected = readonly [AIDL, Language | undefined, PublicKey];

			expectTypeOf<Actual>().toEqualTypeOf<Expected>();
		});

		it("from record (1:N) with `hybrid` variant", () => {
			const source = by_extensions;

			const result = getMany(source, [".ash", T_INVALID, T_DYNAMIC_S], { keys: "hybrid" });

			type Actual = typeof result;
			type Actual_ = ElementArraysOf<Actual>;

			type Expected = [[KoLmafiaASH, AGSScript], Language[] | undefined, Language[] | undefined];
			type Expected_ = ElementArraysOf<DeepReadonlyArray<Expected>>;

			expectTypeOf<Actual>().toExtend<Expected_>();
			expectTypeOf<Expected_>().toExtend<Actual_>();
		});

		it("from record (1:1) with `loose` variant", () => {
			const source = by_name;

			const result = getMany(source, ["AIDL", T_INVALID, "Public Key"], { keys: "loose" });

			type Actual = typeof result;

			type Expected = readonly (Language | undefined)[];

			expectTypeOf<Actual>().toEqualTypeOf<Expected>();
		});

		it("from record (1:N) with `loose` variant", () => {
			const source = by_extensions;

			const result = getMany(source, [".2da", T_INVALID, "DYNAMIC" as string], { keys: "loose" });

			type Actual = typeof result;
			type Actual_ = ElementArraysOf<Actual>;

			type Expected = readonly (readonly Language[] | undefined)[];
			type Expected_ = ElementArraysOf<Expected>;

			expectTypeOf<Actual>().toExtend<Expected>();
			expectTypeOf<Expected_>().toExtend<Actual_>();
		});
	});

	//
	describe("get Lazy One", () => {
		it("from record (1:1)", async () => {
			const source = lazy_by_name;
			const result = await getLazyOne(source, "AIDL");

			type Actual = typeof result;

			type Expected = AIDL;

			expectTypeOf<Actual>().toEqualTypeOf<Expected>();
		});

		it("from record (1:N)", async () => {
			const source = lazy_by_extensions;
			const result = await getLazyOne(source, ".ash");

			type Actual = typeof result;
			type Actual_ = readonly Actual[number][];

			type Expected = readonly [KoLmafiaASH, AGSScript][number][];

			expectTypeOf<Actual>().toExtend<Expected>();
			expectTypeOf<Expected>().toExtend<Actual_>();
		});

		it("from record (1:1) with `known` variant", async () => {
			const source = by_name;

			const result = await getLazyOne(source, "AGS Script", { key: "known" });

			type Actual = typeof result;

			type Expected = AGSScript;

			expectTypeOf<Actual>().toEqualTypeOf<Expected>();
		});

		it("from record (1:N) with `known` variant", async () => {
			const source = by_extensions;

			const result = await getLazyOne(source, ".ash", { key: "known" });

			type Actual = typeof result;
			type Actual_ = readonly Actual[number][];

			// inner arrays element positions may change
			type Expected = readonly [KoLmafiaASH, AGSScript];
			type Expected_ = readonly Expected[number][];

			expectTypeOf<Actual>().toExtend<Expected_>();
			expectTypeOf<Expected_>().toExtend<Actual_>();
		});
	});

	describe("get Lazy Many", () => {
		it("from record (1:1)", async () => {
			const source = lazy_by_name;
			const result = await getLazyMany(source, ["1C Enterprise", "KoLmafia ASH"]);

			type Actual = typeof result;

			type Expected = readonly [_1CEnterprise, KoLmafiaASH];

			expectTypeOf<Actual>().toEqualTypeOf<Expected>();
		});

		it("from record (1:N)", async () => {
			const source = lazy_by_extensions;
			const result = await getLazyMany(source, [".asc", ".ash"]);

			type Actual = typeof result;
			type Actual_ = ElementArraysOf<Actual>;

			type Expected = [[AsciiDoc, AGSScript, PublicKey], [KoLmafiaASH, AGSScript]];
			type Expected_ = ElementArraysOf<DeepReadonlyArray<Expected>>;

			expectTypeOf<Actual>().toExtend<Expected_>();
			expectTypeOf<Expected_>().toExtend<Actual_>();
		});

		it("from record (1:1) with `hybrid` variant", async () => {
			const source = by_name;

			const result = await getLazyMany(source, ["Public Key", "AIDL", T_INVALID], { keys: "hybrid" });

			type Actual = typeof result;

			type Expected = readonly [PublicKey, AIDL, Language | undefined];

			expectTypeOf<Actual>().toEqualTypeOf<Expected>();
		});

		it("from record (1:N) with `hybrid` variant", async () => {
			const source = by_extensions;

			const result = await getLazyMany(source, [".asc", T_INVALID, T_DYNAMIC_S, ".ash"], { keys: "hybrid" });

			type Actual = typeof result;
			type Actual_ = ElementArraysOf<Actual>;

			type Expected = [
				[AsciiDoc, PublicKey, AGSScript],
				Language[] | undefined,
				Language[] | undefined,
				[KoLmafiaASH, AGSScript],
			];

			type Expected_ = ElementArraysOf<DeepReadonlyArray<Expected>>;

			expectTypeOf<Actual>().toExtend<Expected_>();
			expectTypeOf<Expected_>().toExtend<Actual_>();
		});

		it("from record (1:1) with `loose` variant", async () => {
			const source = by_name;

			const result = await getLazyMany(source, ["AIDL", T_INVALID, "Public Key"], { keys: "loose" });

			type Actual = typeof result;

			type Expected = readonly (Language | undefined)[];

			expectTypeOf<Actual>().toEqualTypeOf<Expected>();
		});

		it("from record (1:N) with `loose` variant", async () => {
			const source = by_extensions;

			const result = await getLazyMany(source, [".2da", T_INVALID, "DYNAMIC" as string], { keys: "loose" });

			type Actual = typeof result;
			type Actual_ = ElementArraysOf<Actual>;

			type Expected = readonly (readonly Language[] | undefined)[];
			type Expected_ = ElementArraysOf<Expected>;

			expectTypeOf<Actual>().toExtend<Expected>();
			expectTypeOf<Expected_>().toExtend<Actual_>();
		});
	});

	//
	describe("get Dynamic One", () => {
		it("from record (1:1)", async () => {
			const source = dynamic_by_name;

			const result = await getDynamicOne(source, "2-Dimensional Array");

			type Actual = typeof result;

			type Expected = readonly [_2DimensionalArray];

			expectTypeOf<Actual>().toEqualTypeOf<Expected>();

			//
		});

		//
		it("from record (1:N)", async () => {
			const source = dynamic_by_extensions;
			const result = await getDynamicOne(source, ".ash");

			type Actual = typeof result;
			type Actual_ = readonly Actual[number][];

			type Expected = readonly [KoLmafiaASH, AGSScript][number][];

			expectTypeOf<Actual>().toExtend<Expected>();
			expectTypeOf<Expected>().toExtend<Actual_>();
		});

		it("from record (1:1) with `known` variant", async () => {
			const source = dynamic_by_name;

			const result = await getDynamicOne(source, "AGS Script", { key: "known" });

			type Actual = typeof result;

			type Expected = readonly [AGSScript];

			expectTypeOf<Actual>().toEqualTypeOf<Expected>();
		});

		it("from record (1:N) with `known` variant", async () => {
			const source = dynamic_by_extensions;

			const result = await getDynamicOne(source, ".ash", { key: "known" });

			type Actual = typeof result;
			type Actual_ = readonly Actual[number][];

			// inner arrays element positions may change
			type Expected = readonly [KoLmafiaASH, AGSScript][number][];

			expectTypeOf<Actual>().toExtend<Expected>();
			expectTypeOf<Expected>().toExtend<Actual_>();
		});
	});

	describe("get Dynamic Many", () => {
		it("from records (1:1)", async () => {
			const source = dynamic_by_name;
			const result = await getDynamicMany(source, ["AsciiDoc", "AGS Script", "API Blueprint"]);

			type Actual = typeof result;

			type Expected = [[AsciiDoc], [AGSScript], [APIBlueprint]];
			type Expected_ = DeepReadonlyArray<Expected>;

			expectTypeOf<Actual>().toEqualTypeOf<Expected_>();
		});

		it("from records with array (1:N)", async () => {
			const source = dynamic_by_extensions;
			const result = await getDynamicMany(source, [".bsl", ".asc"]);

			type Actual = typeof result;
			type Actual_ = ElementArraysOf<Actual>;

			// outer slots r fixed, inner arrays r flexible
			type Expected = [[_1CEnterprise], [PublicKey, AsciiDoc, AGSScript]];
			type Expected_ = ElementArraysOf<DeepReadonlyArray<Expected>>;

			expectTypeOf<Actual>().toExtend<Expected_>();
			expectTypeOf<Expected_>().toExtend<Actual_>();
		});

		it("from record (1:1) with `hybrid` variant", async () => {
			const source = dynamic_by_name;

			const result = await getDynamicMany(source, ["Public Key", "AIDL", T_INVALID, "AsciiDoc"], { keys: "hybrid" });

			type Actual = typeof result;
			type Actual_ = ElementArraysOf<Actual>;

			type Expected = [[PublicKey], [AIDL], [] | [Language], [AsciiDoc]];
			type Expected_ = ElementArraysOf<DeepReadonlyArray<Expected>>;

			expectTypeOf<Actual>().toExtend<Expected_>();
			expectTypeOf<Expected_>().toExtend<Actual_>();
		});

		it("from record (1:N) with `hybrid` variant", async () => {
			const source = dynamic_by_extensions;

			const result = await getDynamicMany(source, [".asc", T_INVALID, T_DYNAMIC_S, ".ash"], { keys: "hybrid" });

			type Actual = typeof result;
			type Actual_ = ElementArraysOf<Actual>;

			type Expected = [[AsciiDoc, PublicKey, AGSScript], Language[] | [], Language[] | [], [KoLmafiaASH, AGSScript]];
			type Expected_ = ElementArraysOf<DeepReadonlyArray<Expected>>;

			expectTypeOf<Actual>().toExtend<Expected_>();
			expectTypeOf<Expected_>().toExtend<Actual_>();
		});

		it("from record (1:1) with `loose` variant", async () => {
			const source = dynamic_by_name;

			const result = await getDynamicMany(source, ["AIDL", T_INVALID, "Public Key"], { keys: "loose" });

			type Actual = typeof result;

			type Expected = readonly (readonly [] | readonly [Language])[];

			expectTypeOf<Actual>().toEqualTypeOf<Expected>();
		});

		it("from record (1:N) with `loose` variant", async () => {
			const source = dynamic_by_extensions;

			const result = await getDynamicMany(source, [".2da", T_INVALID, T_DYNAMIC_S], { keys: "loose" });

			type Actual = typeof result;
			type Actual_ = ElementArraysOf<Actual>;

			type Expected = readonly (readonly Language[] | readonly [])[];
			type Expected_ = ElementArraysOf<Expected>;

			expectTypeOf<Actual>().toExtend<Expected>();
			expectTypeOf<Expected_>().toExtend<Actual_>();
		});
	});

	//
	describe("get Dynamic One - Client", () => {
		it("from record", async () => {
			const source = dynamic_by_name;

			const result = await getDynamicOneClient(source, "AGS Script");

			type Actual = typeof result;

			type E = readonly [AGSScript];

			expectTypeOf<Actual>().toEqualTypeOf<E>();

			//
		});

		it("from record (1:N)", async () => {
			const source = dynamic_by_extensions;
			const result = await getDynamicOneClient(source, ".ash");

			type Actual = typeof result;
			type Actual_ = readonly Actual[number][];

			type Expected = readonly [KoLmafiaASH, AGSScript][number][];

			expectTypeOf<Actual>().toExtend<Expected>();
			expectTypeOf<Expected>().toExtend<Actual_>();
		});

		it("from record (1:1) with `known` variant", async () => {
			const source = dynamic_by_name;

			const result = await getDynamicOneClient(source, "AIDL", { key: "known" });

			type Actual = typeof result;

			type Expected = readonly [AIDL];

			expectTypeOf<Actual>().toEqualTypeOf<Expected>();
		});

		it("from record (1:N) with `known` variant", async () => {
			const source = dynamic_by_extensions;

			const result = await getDynamicOneClient(source, ".bsl", { key: "known" });

			type Actual = typeof result;
			type Actual_ = readonly Actual[number][];

			// inner arrays element positions may change
			type Expected = readonly [_1CEnterprise][number][];

			expectTypeOf<Actual>().toExtend<Expected>();
			expectTypeOf<Expected>().toExtend<Actual_>();
		});
	});

	describe("get Dynamic Many - Client", () => {
		it("from record", async () => {
			const source = dynamic_by_name;
			const result = await getDynamicManyClient(source, ["1C Enterprise", "KoLmafia ASH"]);

			type Actual = typeof result;

			type Expected = [[_1CEnterprise], [KoLmafiaASH]];

			expectTypeOf<Actual>().toEqualTypeOf<DeepReadonlyArray<Expected>>();
		});

		it("from record (1:N)", async () => {
			const source = dynamic_by_extensions;
			const result = await getDynamicManyClient(source, [".ash", ".asc"]);

			type Actual = typeof result;
			type Actual_ = ElementArraysOf<Actual>;

			type Expected = [[KoLmafiaASH, AGSScript], [AsciiDoc, PublicKey, AGSScript]];
			type Expected_ = ElementArraysOf<DeepReadonlyArray<Expected>>;

			expectTypeOf<Actual>().toExtend<Expected_>();
			expectTypeOf<Expected_>().toExtend<Actual_>();
		});

		it("from record (1:1) with `hybrid` variant", async () => {
			const source = dynamic_by_name;

			const result = await getDynamicManyClient(source, ["KoLmafia ASH", "API Blueprint", T_INVALID, "AsciiDoc"], {
				keys: "hybrid",
			});

			type Actual = typeof result;
			type Actual_ = ElementArraysOf<Actual>;

			type Expected = [[KoLmafiaASH], [APIBlueprint], [] | [Language], [AsciiDoc]];
			type Expected_ = ElementArraysOf<DeepReadonlyArray<Expected>>;

			expectTypeOf<Actual>().toExtend<Expected_>();
			expectTypeOf<Expected_>().toExtend<Actual_>();
		});

		it("from record (1:N) with `hybrid` variant", async () => {
			const source = dynamic_by_extensions;

			const result = await getDynamicManyClient(source, [T_INVALID, ".asc", T_DYNAMIC_S, ".ash"], { keys: "hybrid" });

			type Actual = typeof result;
			type Actual_ = ElementArraysOf<Actual>;

			type Expected = [Language[] | [], [AsciiDoc, PublicKey, AGSScript], Language[] | [], [KoLmafiaASH, AGSScript]];
			type Expected_ = ElementArraysOf<DeepReadonlyArray<Expected>>;

			expectTypeOf<Actual>().toExtend<Expected_>();
			expectTypeOf<Expected_>().toExtend<Actual_>();
		});

		it("from record (1:1) with `loose` variant", async () => {
			const source = dynamic_by_name;

			const result = await getDynamicManyClient(source, ["AIDL", T_INVALID, "Public Key"], { keys: "loose" });

			type Actual = typeof result;

			type Expected = readonly (readonly [] | readonly [Language])[];

			expectTypeOf<Actual>().toEqualTypeOf<Expected>();
		});

		it("from record (1:N) with `loose` variant", async () => {
			const source = dynamic_by_extensions;

			const result = await getDynamicManyClient(source, [".2da", T_INVALID, T_DYNAMIC_S], { keys: "loose" });

			type Actual = typeof result;
			type Actual_ = ElementArraysOf<Actual>;

			type Expected = readonly (readonly Language[] | readonly [])[];
			type Expected_ = ElementArraysOf<Expected>;

			expectTypeOf<Actual>().toExtend<Expected>();
			expectTypeOf<Expected_>().toExtend<Actual_>();
		});
	});
});
