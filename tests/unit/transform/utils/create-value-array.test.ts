import { describe, expect, it } from "vitest";
import { configLoader } from "@/infra/loaders/config-loader";
import { createValueArray } from "@/transform/utils/create-value-array";

describe("createValueArray", async () => {
	///

	const config = await configLoader();

	it("should collect unique values from nested arrays", () => {
		const source = {
			key1: {
				field: [1, 2, 3],
			},
			key2: {
				field: [2, 3, 4],
			},
		};

		const result = createValueArray({ source, field: "field", config });

		expect(result).toEqual([1, 2, 3, 4]);
	});

	it("should ignore nullish values", () => {
		const source = {
			key1: {
				field: null,
			},
			key2: {
				field: undefined,
			},
			key3: {
				field: [undefined, null],
			},
		};

		const result = createValueArray({ source, field: "field", config });

		expect(result).toHaveLength(0);
	});

	it("should skip null/undefined but include valid values", () => {
		const source = {
			key3: {
				field: [1, undefined, "a", null, 2],
			},
		};

		const result = createValueArray({ source, field: "field", config });

		expect(result).toEqual([1, "a", 2]);
	});
});
