const api_blueprint = {
	ace_mode: "markdown",
	color: "#2ACCA8",
	extensions: [".apib"],
	language_id: 5,
	name: "API Blueprint",
	tm_scope: "text.html.markdown.source.gfm.apib",
	type: "markup",
} as const;

type APIBlueprint = typeof api_blueprint;

export { api_blueprint };
export type { APIBlueprint };
