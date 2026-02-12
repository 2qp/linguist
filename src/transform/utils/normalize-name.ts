import { createSafeName } from "./create-safe-name";
import { toUpperCase } from "@utils/to-uppercase";

const SPECIAL_CHAR_REPLACEMENTS = {
	"#": "Sharp",
	"*": "Star",
	"+": "Plus",
	"-": "_",
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

const pascalize = (s?: string): string => {
	return (s ?? "")
		.split(/[^a-zA-Z0-9]+/)
		.filter(Boolean)
		.map((word) => {
			if (/^[A-Z][a-z]*[A-Z]/.test(word) || /^[A-Z]+$/.test(word)) {
				return word;
			}

			if (word.length > 1 && /^\d/.test(word)) {
				return word.charAt(0) + word.charAt(1).toUpperCase() + word.slice(2).toLowerCase();
			}

			return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
		})
		.join("");
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

	const pascalized = pascalize(replaced);

	const result = pascalized.replace(/[^a-zA-Z0-9]/g, "");
	if (!result) return "Unknown";

	const ready = /^\d/.test(result) ? `_${result}` : result;

	const safeName = createSafeName(ready);

	return safeName;
};

const sanitizeConstant = <const TName extends string>(str: TName): Uppercase<TName> => {
	//

	const regex = new RegExp(
		`[${Object.keys(SPECIAL_CHAR_REPLACEMENTS).map(escapeForCharClass).join("")}]` as const,
		"g",
	);

	const replaced = str.replace(
		regex,
		(match) => SPECIAL_CHAR_REPLACEMENTS[match as keyof typeof SPECIAL_CHAR_REPLACEMENTS],
	);

	const uppercased = replaced.toUpperCase();

	const result = uppercased.replace(/[^a-zA-Z0-9_$]/g, "_");
	if (!result) {
		const transformed = toUpperCase(`Unknown` as TName);
		return transformed;
	}

	const ready = /^\d/.test(result) ? `_${result}` : result;

	const safeName = createSafeName(ready) as TName;

	const transformed = toUpperCase(safeName);

	return transformed;
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

type NormalizedName<TName extends string = string> = {
	key: string;
	varName: string;
	varNameCamel: string;
	typeName: string;
	fileName: string;
	constant: Uppercase<TName>;
};

// type NormalizeNameParams = {};

type NormalizeName = <const TName extends string>(name: TName) => NormalizedName<TName>;

const normalizeName: NormalizeName = (name) => {
	//

	return {
		key: name,
		varName: sanitizeVarName(name),
		varNameCamel: toCamelCase(sanitizeVarName(name)),
		typeName: sanitizeTypeName(name),
		fileName: sanitizeFileName(name),
		constant: sanitizeConstant(name),
	} as const;
};

export { normalizeName };
export type { NormalizedName, NormalizeName };
