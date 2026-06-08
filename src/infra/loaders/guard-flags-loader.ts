const guardFlagsLoader = () =>
	({
		behavior: {
			bypass: process.env.BYPASS === "true",
		},
		target: {
			removals: process.env.REMOVALS === "true",
		},
	}) as const;

export { guardFlagsLoader };
