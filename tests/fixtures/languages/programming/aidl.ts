const aidl = {
	ace_mode: "text",
	color: "#34EB6B",
	extensions: [".aidl"],
	interpreters: ["aidl"],
	language_id: 451700185,
	name: "AIDL",
	tm_scope: "source.aidl",
	type: "programming",
} as const;

type AIDL = typeof aidl;

export { aidl };
export type { AIDL };
