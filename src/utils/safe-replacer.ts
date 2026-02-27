type ReplaceAll<
	S extends string,
	From extends string,
	To extends string,
	Result extends string = "",
> = S extends `${infer Head}${From}${infer Tail}`
	? ReplaceAll<Tail, From, To, `${Result}${Head}${To}`>
	: `${Result}${S}`;

type SafeReplacerType = <const S extends string, const P extends string, const R extends string>(
	source: S,
	pattern: P,
	replacement: R,
) => ReplaceAll<S, P, R>;

const safeReplacer: SafeReplacerType = (s, p, r) => {
	return s.replaceAll(p, r) as ReplaceAll<typeof s, typeof p, typeof r>;
};

export { safeReplacer };
export type { ReplaceAll, SafeReplacerType };
