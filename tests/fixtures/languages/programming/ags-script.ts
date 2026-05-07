const ags_script = {
	ace_mode: "c_cpp",
	aliases: ["ags"],
	codemirror_mime_type: "text/x-c++src",
	codemirror_mode: "clike",
	color: "#B9D9FF",
	extensions: [".asc", ".ash"],
	language_id: 2,
	name: "AGS Script",
	tm_scope: "source.c++",
	type: "programming",
} as const;

type AGSScript = typeof ags_script;

export { ags_script };
export type { AGSScript };
