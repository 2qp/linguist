const kolmafia_ash = {
	ace_mode: "text",
	color: "#B9D9B9",
	extensions: [".ash"],
	language_id: 852099832,
	name: "KoLmafia ASH",
	tm_scope: "source.ash",
	type: "programming",
} as const;

type KoLmafiaASH = typeof kolmafia_ash;

export { kolmafia_ash };
export type { KoLmafiaASH };
