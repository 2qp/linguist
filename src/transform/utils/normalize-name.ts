import { createSafeName } from "./create-safe-name";

const SPECIAL_CHAR_REPLACEMENTS = {
	"#": "Sharp",
	"*": "Star",
	"+": "Plus",
	"-": "",
	"&": "And",
	"|": "Or",
	"@": "At",
	$: "Dollar",
	"%": "Percent",
	"^": "Caret",
	"=": "Equals",
	"!": "Not",
	"?": "Question",
	"~": "Tilde",
	"`": "Backtick",
	"'": "Prime",
	'"': "DoubleQuote",
	"<": "LessThan",
	">": "GreaterThan",
	"/": "Slash",
	"\\": "Backslash",
	"(": "ParenL",
	")": "ParenR",
	"[": "BracketL",
	"]": "BracketR",
	"{": "BraceL",
	"}": "BraceR",
	// " ": "",
} as const satisfies Record<string, string>;

// for file names
const DASH_REPLACEMENTS = {
	"#": "-sharp",
	"*": "-star",
	"+": "-plus",
	"&": "-and",
	"@": "-at",
	$: "-dollar",
	"%": "-percent",
	"^": "-caret",
	"=": "-equals",
	"!": "-not",
	"?": "-question",
	"~": "-tilde",
	"'": "-prime",
	'"': "-double-quote",
	"<": "-less-than",
	">": "-greater-than",
	"/": "-slash",
	"\\": "-backslash",
	"(": "-paren-l",
	")": "-paren-r",
	"[": "-bracket-l",
	"]": "-bracket-r",
	"{": "-brace-l",
	"}": "-brace-r",
} as const satisfies Record<string, string>;

const capitalize = (s: string): string => {
	return (s?.[0]?.toUpperCase() ?? "") + (s?.slice(1) ?? "");
};

const toCamelCase = (str: string): string => {
	return str
		.replace(/^[\s_-]+/, "")
		.toLowerCase()
		.replace(/[\s_-]+(.)/g, (_, c) => c.toUpperCase());
};

const escapeForCharClass = (s: string) => s.replace(/[\\^$.*+?()[\]{}|-]/g, "\\$&");

const sanitizeFileName = (str: string) => {
	const strs = str.toLowerCase();

	const regex = new RegExp(`[${Object.keys(DASH_REPLACEMENTS).map(escapeForCharClass).join("")}]`, "g");

	const strDashReplaced = strs.replace(regex, (match) => DASH_REPLACEMENTS[match as keyof typeof DASH_REPLACEMENTS]);

	const strDashed = strDashReplaced.replace(/\s+/g, "-");

	const result = strDashed
		.replace(/[^a-z0-9-]/g, "_")
		.replace(/-+/g, "-")
		.replace(/_+/g, "_")
		.replace(/^[-_]|[-_]$/g, "");

	return result || "unknown";
};

const sanitizeTypeName = (str: string) => {
	//

	const regex = new RegExp(`[${Object.keys(SPECIAL_CHAR_REPLACEMENTS).map(escapeForCharClass).join("")}]`, "g");

	const replaced = str.replace(
		regex,
		(match) => SPECIAL_CHAR_REPLACEMENTS[match as keyof typeof SPECIAL_CHAR_REPLACEMENTS],
	);

	const result = replaced.replace(/[^a-zA-Z0-9]/g, "");
	if (!result) return "Unknown";

	const ready = /^\d/.test(result) ? `_${result}` : result;

	// const capitalized = capitalize(`${ready}Type`);
	const capitalized = capitalize(ready);

	const safeName = createSafeName(capitalized);

	return safeName;
};

const sanitizeVarName = (str: string) => {
	const regex = new RegExp(`[${Object.keys(SPECIAL_CHAR_REPLACEMENTS).map(escapeForCharClass).join("")}]`, "g");

	const replaced = str.replace(
		regex,
		(match) => SPECIAL_CHAR_REPLACEMENTS[match as keyof typeof SPECIAL_CHAR_REPLACEMENTS],
	);

	const prevResult = replaced.replace(/[^a-zA-Z0-9_$]/g, "_");
	const result = prevResult.toLowerCase();

	if (!result) return "_unknown";
	return /^\d/.test(result) ? `_${result}` : result;
};

type NormalizedName = {
	key: string;
	varName: string;
	varNameCamel: string;
	typeName: string;
	fileName: string;
};

// type NormalizeNameParams = {};

type NormalizeName = (name: string) => NormalizedName;

const normalizeName: NormalizeName = (name) => {
	//

	return {
		key: name,
		varName: sanitizeVarName(name),
		varNameCamel: toCamelCase(sanitizeVarName(name)),
		typeName: sanitizeTypeName(name),
		fileName: sanitizeFileName(name),
	};
};

export { normalizeName };
export type { NormalizedName, NormalizeName };
