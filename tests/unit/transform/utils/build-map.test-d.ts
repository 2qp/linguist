import { languagesFixture } from "@tests/fixtures/languages.fixture";
import { describe, expectTypeOf, it } from "vitest";
import { buildMap } from "@/transform/utils/build-map";

import type { LanguageData } from "@/types/lang.types";

describe("buildMap types", async () => {
	///

	// will handle `NonNullable`s later

	it("infers a collected all array items on right side", () => {
		const source = languagesFixture;
		const result = buildMap({ source, kind: "primitive", key: "name", value: "extensions" });

		type K = "1C Enterprise" | "2-Dimensional Array" | "MAXScript" | "Unix Assembly";
		type V = readonly [".2da"] | readonly [".bsl", ".os"] | readonly [".ms", ".mcr"] | readonly [".s", ".ms"];

		expectTypeOf(result).toEqualTypeOf<Map<K, V>>();
	});

	it("infers a collected all array items on left side", () => {
		const source = languagesFixture;
		const result = buildMap({ source, kind: "set", left: "extensions", right: "name" });

		type K = ".2da" | ".bsl" | ".mcr" | ".ms" | ".os" | ".s";
		type V = Set<"1C Enterprise" | "2-Dimensional Array" | "MAXScript" | "Unix Assembly">;

		expectTypeOf(result).toEqualTypeOf<Map<K, V>>();
	});

	describe("set kind", () => {
		it("infers a aggregated values into Sets", () => {
			const source = {
				en: { key: [1, 2, 3], value: "A" },
				fr: { key: [2, 4], value: "B" },
			} as const;

			const result = buildMap({ source, kind: "set", left: "key", right: "value" });

			type K = 1 | 2 | 3 | 4;
			type V = Set<"A" | "B">;

			expectTypeOf(result).toEqualTypeOf<Map<K, V>>();
		});

		it("infers a empty source", () => {
			const source: LanguageData = {} as const;
			const result = buildMap({
				source,
				kind: "set",
				left: "key",
				right: "value",
			});

			type K = unknown;
			type V = Set<unknown>;

			expectTypeOf(result).toEqualTypeOf<Map<K, V>>();
		});

		it("infers a skipped null/undefined values", () => {
			const source = {
				en: { key: [null, 1], value: undefined },
				fr: { key: [2], value: "B" },
			} as const;

			const result = buildMap({
				source,
				kind: "set",
				left: "key",
				right: "value",
			});

			type K = 1 | 2 | null;
			type V = Set<"B" | undefined>;

			expectTypeOf(result).toEqualTypeOf<Map<K, V>>();
		});

		it("infers a handle arrays with null items", () => {
			const source = {
				en: { key: [null, 1, null], value: "A" },
				fr: { key: [2], value: "B" },
			} as const;

			const result = buildMap({
				source,
				kind: "set",
				left: "key",
				right: "value",
			});

			type K = 1 | 2 | null;
			type V = Set<"A" | "B">;

			expectTypeOf(result).toEqualTypeOf<Map<K, V>>();
		});

		it("infers left non-array and right array", () => {
			const source = {
				en: { key: 1, value: ["A", "B", "C"] },
				fr: { key: 2, value: ["C", "D", "E"] },
			} as const;

			const result = buildMap({
				source,
				kind: "set",
				left: "key",
				right: "value",
			});

			type K = 1 | 2;
			type V = Set<readonly ["A", "B", "C"] | readonly ["C", "D", "E"]>;

			expectTypeOf(result).toEqualTypeOf<Map<K, V>>();
		});

		it("infers multiple same left non-arrays and right array", () => {
			const source = {
				en: { key: 1, value: ["A", "B", "C"] },
				fr: { key: 1, value: ["C", "D", "E"] },
			} as const;

			const result = buildMap({
				source,
				kind: "set",
				left: "key",
				right: "value",
			});

			type K = 1;
			type V = Set<readonly ["A", "B", "C"] | readonly ["C", "D", "E"]>;

			expectTypeOf(result).toEqualTypeOf<Map<K, V>>();
		});

		it("infers arrays of both left and right", () => {
			const source = {
				en: { key: [1, 2, 3], value: ["A", "B", "C"] },
				fr: { key: [2, 4], value: ["C", "D", "E"] },
			} as const;

			const result = buildMap({
				source,
				kind: "set",
				left: "key",
				right: "value",
			});

			type K = 1 | 2 | 3 | 4;
			type V = Set<readonly ["A", "B", "C"] | readonly ["C", "D", "E"]>;

			expectTypeOf(result).toEqualTypeOf<Map<K, V>>();
		});

		// infers arrays of both left and right with skipped null/undefined values
		// mmm will do omission of null/undefined, array merging in type-level later
		it("infers arrays of both left and right with null/undefined values", () => {
			const source = {
				en: { key: [1, 2, 3, null], value: ["A", "B", "C", undefined] },
				fr: { key: [2, 4, undefined], value: ["C", "D", "E", null] },
			} as const;

			const result = buildMap({
				source,
				kind: "set",
				left: "key",
				right: "value",
			});

			type K = 1 | 2 | 3 | 4 | null | undefined;
			type V = Set<readonly ["A", "B", "C", undefined] | readonly ["C", "D", "E", null]>;

			expectTypeOf(result).toEqualTypeOf<Map<K, V>>();
		});
	});

	describe("custom kind", () => {
		it("infers a create value objects", () => {
			const source = {
				en: { key: [1, 2], name: "Alice", age: 30 },
				fr: { key: [2, 3], name: "Bob", age: 25 },
			} as const;

			const result = buildMap({
				source,
				kind: "custom",
				left: "key",
				properties: ["name", "age"],
			});

			type K = 1 | 2 | 3;
			type V = { age: 25 | 30; name: "Alice" | "Bob" }[];

			expectTypeOf(result).toEqualTypeOf<Map<K, V>>();
		});

		it("infers a handle empty properties", () => {
			const source = {
				en: { key: [1, 2], name: "Alice", age: 30 },
			} as const;

			const result = buildMap({
				source,
				kind: "custom",
				left: "key",
				properties: [],
			});

			type K = 1 | 2;

			// biome-ignore lint/complexity/noBannedTypes: type test
			type V = {}[];

			expectTypeOf(result).toEqualTypeOf<Map<K, V>>();
		});

		it("infers a skipped non-array left values", () => {
			const source = {
				en: { key: 1, name: "Alice", age: 30 },
			} as const;

			const result = buildMap({
				source,
				kind: "custom",
				left: "key",
				properties: ["name", "age"],
			});

			type K = 1;
			type V = { age: 30; name: "Alice" }[];

			expectTypeOf(result).toEqualTypeOf<Map<K, V>>();
		});

		it("infers a handle missing properties", () => {
			const source = {
				en: { key: [1, 2], name: "Alice" },
				fr: { key: [2, 3], age: 25 },
			} as const;

			const result = buildMap({
				source,
				kind: "custom",
				left: "key",
				properties: ["name", "age"],
			});

			type K = 1 | 2 | 3;
			type V = { age: 25; name: "Alice" }[];

			expectTypeOf(result).toEqualTypeOf<Map<K, V>>();
		});

		it("infers a handle missing property when left is an array and right is a missing primitive", () => {
			const source = {
				en: { key: [1, 2], name: "Alice" },
				fr: { key: [2, 3], age: 25 },
			} as const;

			const result = buildMap({
				source,
				kind: "custom",
				left: "key",
				properties: ["age"],
			});

			type K = 1 | 2 | 3;
			type V = { age: 25 }[];

			expectTypeOf(result).toEqualTypeOf<Map<K, V>>();
		});

		it("infers a handle missing property when left is a primitive and right is a missing primitive", () => {
			const source = {
				en: { key: [1, 2], name: "Alice" },
				de: { name: "Noah", age: 20 },
			} as const;

			const result = buildMap({
				source,
				kind: "custom",
				left: "name",
				properties: ["age"],
			});

			type K = "Alice" | "Noah";
			type V = { age: 20 }[];

			expectTypeOf(result).toEqualTypeOf<Map<K, V>>();
		});
	});

	describe("primitive kind", () => {
		it("infers a mapped primitive values", () => {
			const source = {
				en: { key: 1, value: "A" },
				fr: { key: 2, value: "B" },
			} as const;

			const result = buildMap({
				source,
				kind: "primitive",
				key: "key",
				value: "value",
			});

			type K = 1 | 2;
			type V = "A" | "B";

			expectTypeOf(result).toEqualTypeOf<Map<K, V>>();
		});

		it("infers a skipped array left values", () => {
			const source = {
				en: { key: [1, 2], value: "A" },
			} as const;

			const result = buildMap({
				source,
				kind: "primitive",
				key: "key",
				value: "value",
			});

			type K = 1 | 2;
			type V = "A";

			expectTypeOf(result).toEqualTypeOf<Map<K, V>>();
		});

		it("infers a skipped undefined right values", () => {
			const source = {
				en: { key: 1, value: undefined },
			} as const;

			const result = buildMap({
				source,
				kind: "primitive",
				key: "key",
				value: "value",
			});

			type K = 1;
			type V = undefined;

			expectTypeOf(result).toEqualTypeOf<Map<K, V>>();
		});

		it("infers a skipped null left values", () => {
			const source = {
				en: { key: null, value: "A" },
			} as const;

			const result = buildMap({
				source,
				kind: "primitive",
				key: "key",
				value: "value",
			});

			type K = null;
			type V = "A";

			expectTypeOf(result).toEqualTypeOf<Map<K, V>>();
		});
	});

	describe("default case", () => {
		it("infers a unknown union for unknown kinds", () => {
			const source: LanguageData = {};
			const result = buildMap({
				source,
				//@ts-expect-error
				kind: "unknown",
				key: "key",
				value: "value",
			});

			type Expected =
				| Map<unknown, Set<unknown>> //
				| Map<unknown, { [x: string]: unknown }[]>
				| Map<unknown, unknown>;

			expectTypeOf(result).toEqualTypeOf<Expected>();
		});
	});
});
