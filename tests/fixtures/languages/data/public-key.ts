const public_key = {
	ace_mode: "text",
	codemirror_mime_type: "application/pgp",
	codemirror_mode: "asciiarmor",
	extensions: [".asc", ".pub"],
	language_id: 298,
	name: "Public Key",
	tm_scope: "none",
	type: "data",
} as const;

type PublicKey = typeof public_key;

export { public_key };
export type { PublicKey };
