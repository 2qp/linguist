type Block =
	| { kind: "import"; code: string; import_kind?: "value" | "type"; group?: string | undefined }
	| { kind: "expr"; code: string; prefixed?: boolean; export?: boolean; group?: string }
	| { kind: "type"; code: string; prefixed?: boolean; export?: boolean; group?: string }
	| { kind: "meta"; code: string; export?: boolean; group?: string };

export type { Block };
