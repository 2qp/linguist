import { languagesFixture } from "@tests/fixtures/languages.fixture";
import { describe, expect, it } from "vitest";
import { buildMap } from "@/transform/utils/build-map";

import type { LanguageData } from "@/types/lang.types";

describe("buildMap", async () => {
	///

	it("should collect all array items on right side", () => {
		const source = languagesFixture;
		const result = buildMap({ source, kind: "primitive", key: "name", value: "extensions" });

		const expected = new Map([
			["1C Enterprise", [".bsl", ".os"]],
			["2-Dimensional Array", [".2da"]],
			["MAXScript", [".ms", ".mcr"]],
			["Unix Assembly", [".s", ".ms"]],
		]);

		expect(result).toEqual(expected);
	});

	it("should collect all array items on left side", () => {
		const source = languagesFixture;
		const result = buildMap({ source, kind: "set", left: "extensions", right: "name" });

		const expected = new Map([
			[".bsl", new Set(["1C Enterprise"])],
			[".2da", new Set(["2-Dimensional Array"])],
			[".os", new Set(["1C Enterprise"])],
			[".ms", new Set(["Unix Assembly", "MAXScript"])],
			[".mcr", new Set(["MAXScript"])],
			[".s", new Set(["Unix Assembly"])],
		]);

		expect(result).toEqual(expected);
	});

	describe("set kind", () => {
		it("should aggregate values into Sets", () => {
			const source = {
				en: { key: [1, 2, 3], value: "A" },
				fr: { key: [2, 4], value: "B" },
			} as const;

			const result = buildMap({ source, kind: "set", left: "key", right: "value" });

			expect(result.size).toBe(4);
			expect(result.get(1)).toEqual(new Set(["A"]));
			expect(result.get(2)).toEqual(new Set(["A", "B"]));
			expect(result.get(3)).toEqual(new Set(["A"]));
			expect(result.get(4)).toEqual(new Set(["B"]));
		});

		it("should handle empty source", () => {
			const source: LanguageData = {} as const;
			const result = buildMap({
				source,
				kind: "set",
				left: "key",
				right: "value",
			});

			expect(result.size).toBe(0);
		});

		it("should skip null/undefined values", () => {
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

			expect(result.size).toBe(2);
			expect(result.get(1)).toEqual(new Set([]));
			expect(result.get(2)).toEqual(new Set(["B"]));
		});

		it("should handle arrays with null items", () => {
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

			expect(result.size).toBe(2);
			expect(result.get(1)).toEqual(new Set(["A"]));
			expect(result.get(2)).toEqual(new Set(["B"]));
		});
	});

	describe("custom kind", () => {
		it("should create value objects", () => {
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

			expect(result.size).toBe(3);
			expect(result.get(1)).toEqual([{ name: "Alice", age: 30 }]);
			expect(result.get(2)).toEqual(
				expect.arrayContaining([
					{ name: "Bob", age: 25 },
					{ name: "Alice", age: 30 },
				]),
			);
			expect(result.get(3)).toEqual([{ name: "Bob", age: 25 }]);
		});

		it("should handle empty properties", () => {
			const source = {
				en: { key: [1, 2], name: "Alice", age: 30 },
			} as const;

			const result = buildMap({
				source,
				kind: "custom",
				left: "key",
				properties: [],
			});

			expect(result.get(1)).toHaveLength(0);
			expect(result.get(2)).toHaveLength(0);
		});

		it("should skip non-array left values", () => {
			const source = {
				en: { key: 1, name: "Alice", age: 30 },
			} as const;

			const result = buildMap({
				source,
				kind: "custom",
				left: "key",
				properties: ["name", "age"],
			});

			expect(result.size).toBe(1);
			expect(result.get(1)).toEqual({ name: "Alice", age: 30 });
		});

		it("should handle missing properties", () => {
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

			expect(result.size).toBe(3);
			expect(result.get(1)).toEqual([{ name: "Alice" }]);
			expect(result.get(2)).toEqual(expect.arrayContaining([{ age: 25 }, { name: "Alice" }]));
			expect(result.get(3)).toEqual([{ age: 25 }]);
		});
	});

	describe("primitive kind", () => {
		it("should map primitive values", () => {
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

			expect(result.size).toBe(2);
			expect(result.get(1)).toBe("A");
			expect(result.get(2)).toBe("B");
		});

		it("should skip array left values", () => {
			const source = {
				en: { key: [1, 2], value: "A" },
			} as const;

			const result = buildMap({
				source,
				kind: "primitive",
				key: "key",
				value: "value",
			});

			expect(result.size).toBe(0);
		});

		it("should skip undefined right values", () => {
			const source = {
				en: { key: 1, value: undefined },
			} as const;

			const result = buildMap({
				source,
				kind: "primitive",
				key: "key",
				value: "value",
			});

			console.log(result.entries());

			expect(result.size).toBe(0);
		});

		it("should skip null left values", () => {
			const source = {
				en: { key: null, value: "A" },
			} as const;

			const result = buildMap({
				source,
				kind: "primitive",
				key: "key",
				value: "value",
			});

			expect(result.size).toBe(0);
		});
	});

	describe("default case", () => {
		it("should return undefined for unknown kinds", () => {
			const source: LanguageData = {};
			const result = buildMap({
				source,
				//@ts-expect-error
				kind: "unknown",
				key: "key",
				value: "value",
			});

			expect(result).toBeUndefined();
		});
	});
});
