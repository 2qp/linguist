const guardFlagsLoader = () =>
	({
		behavior: {
			bypass: process.env.BYPASS === "true",
		},

		target: {
			removals: process.env.REMOVALS === "true",
			consistency: process.env.CONSISTENCY === "true",
		},
	}) as const;

export { guardFlagsLoader };
