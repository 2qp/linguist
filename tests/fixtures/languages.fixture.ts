const languagesFixture = {
	"1C Enterprise": {
		ace_mode: "text",
		color: "#814CCC",
		extensions: [".bsl", ".os"],
		language_id: 0,
		name: "1C Enterprise",
		tm_scope: "source.bsl",
		type: "programming",
	},
	"2-Dimensional Array": {
		ace_mode: "text",
		color: "#38761D",
		extensions: [".2da"],
		language_id: 387204628,
		name: "2-Dimensional Array",
		tm_scope: "source.2da",
		type: "data",
	},
	MAXScript: {
		ace_mode: "text",
		color: "#00a6a6",
		extensions: [".ms", ".mcr"],
		language_id: 217,
		name: "MAXScript",
		tm_scope: "source.maxscript",
		type: "programming",
	},
	"Unix Assembly": {
		ace_mode: "assembly_x86",
		aliases: ["gas", "gnu asm", "unix asm"],
		extensions: [".s", ".ms"],
		group: "Assembly",
		language_id: 120,
		name: "Unix Assembly",
		tm_scope: "source.x86",
		type: "programming",
	},
} as const;

export { languagesFixture };
