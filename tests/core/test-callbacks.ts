const TEST_CALLBACKS: Record<string, (...args: Record<string, unknown>[]) => Promise<void>> = {
	"upstream.guard.test.ts": async () => {},
} as const;

export { TEST_CALLBACKS };
