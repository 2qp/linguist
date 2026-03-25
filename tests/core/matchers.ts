import { expect } from "vitest";

import type { Primitive } from "@/types/gen.types";

expect.extend({
	toIncludeSupersetWithCounts(actual: Primitive[], expected: Primitive[]) {
		//

		const countMap = <T extends Primitive>(arr: T[]) => {
			const counts = new Map<T, number>();
			for (const item of arr) counts.set(item, (counts.get(item) || 0) + 1);
			return counts;
		};

		const actualCounts = countMap(actual);
		const expectedCounts = countMap(expected);

		for (const [key, expectedCount] of expectedCounts) {
			if ((actualCounts.get(key) || 0) < expectedCount) {
				return {
					pass: false,
					message: () => `expected at least ${expectedCount} of "${key}", found ${actualCounts.get(key) || 0}`,
				};
			}
		}

		return { pass: true, message: () => "passed superset with counts" };
	},
});
