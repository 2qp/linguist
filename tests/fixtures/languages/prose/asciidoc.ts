const asciidoc = {
	ace_mode: "asciidoc",
	color: "#73a0c5",
	extensions: [".asciidoc", ".adoc", ".asc"],
	language_id: 22,
	name: "AsciiDoc",
	tm_scope: "text.html.asciidoc",
	type: "prose",
	wrap: true,
} as const;

type AsciiDoc = typeof asciidoc;

export { asciidoc };
export type { AsciiDoc };
