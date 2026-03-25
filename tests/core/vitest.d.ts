import "vitest";

import type { ElementOf } from "@/types/utility.types";

declare module "vitest" {
	interface Assertion<T = unknown> {
		toIncludeSupersetWithCounts(expected: readonly ElementOf<T>[]): void;
	}

	interface AsymmetricMatchers {
		toIncludeSupersetWithCounts(expected: readonly unknown[]): void;
	}
}
