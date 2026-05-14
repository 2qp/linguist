import { createSafeName } from "./create-safe-name";
import { isNullish } from "@utils/guards";
import { toUpperCase } from "@utils/to-uppercase";

type ReplacementOptions = {
	separate?: boolean;
};

const defaultOptions: Required<ReplacementOptions> = {
	separate: true,
};

type CharReplacement = [replacement: string, options?: ReplacementOptions];

const getConfig = ([replacement, _options = {}]: CharReplacement) => {
	//

	const options = { ...defaultOptions, ..._options };

	return [replacement, options] as const;
};

const SPECIAL_CHAR_REPLACEMENTS = {
	"#": ["Sharp"],
	"*": ["Star"],
	"+": ["Plus"],
	"-": ["_"],
	"&": ["And"],
	"|": ["Or"],
	"@": ["At"],
	$: ["Dollar"],
	"%": ["Percent"],
	"^": ["Caret"],
	"=": ["Equals"],
	"!": ["Not"],
	"?": ["Question"],
	"~": ["Tilde"],
	"`": ["Backtick"],
	"'": ["", { separate: false }],
	'"': ["DoubleQuote"],
	"<": ["LessThan"],
	">": ["GreaterThan"],
	"/": ["Slash"],
	"\\": ["Backslash"],
	"(": [""],
	")": [""],
	"[": [""],
	"]": [""],
	"{": [""],
	"}": [""],
	// " ": "",
} as const satisfies Record<string, CharReplacement>;

// for file names
const DASH_REPLACEMENTS = {
	"#": ["-sharp"],
	"*": ["-star"],
	"+": ["-plus"],
	"&": ["-and"],
	"@": ["-at"],
	$: ["-dollar"],
	"%": ["-percent"],
	"^": ["-caret"],
	"=": ["-equals"],
	"!": ["-not"],
	"?": ["-question"],
	"~": ["-tilde"],
	"'": ["", { separate: false }],
	'"': ["-double-quote"],
	"<": ["-less-than"],
	">": ["-greater-than"],
	"/": ["-slash"],
	"\\": ["-backslash"],
	"(": [""],
	")": [""],
	"[": [""],
	"]": [""],
	"{": [""],
	"}": [""],
	".": ["-"],
	_: ["-"],
} as const satisfies Record<string, CharReplacement>;

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

const SPECIAL_CHARS = Object.keys(SPECIAL_CHAR_REPLACEMENTS).map(escapeForCharClass).join("");
const DASH_CHARS = Object.keys(DASH_REPLACEMENTS).map(escapeForCharClass).join("");

const SPECIAL_REGEX = new RegExp(`[${SPECIAL_CHARS}]`, "g");
const DASH_REGEX = new RegExp(`[${DASH_CHARS}]`, "g");

const spacedReplace = (str: string, reg: RegExp, replacements: Record<string, CharReplacement>): string => {
	//

	return str.replace(reg, (match) => {
		//

		const obj = replacements[match as keyof typeof replacements];
		if (isNullish(obj)) return match;

		const [replacement, { separate }] = getConfig(obj);

		return separate ? ` ${replacement} ` : replacement;
	});
};

const replace = (str: string, reg: RegExp, replacements: Record<string, CharReplacement>): string => {
	//

	return str.replace(reg, (match) => {
		//

		const obj = replacements[match as keyof typeof replacements];
		if (isNullish(obj)) return match;

		const [replacement] = getConfig(obj);

		return replacement;
	});
};

const sanitizeFileName = (str: string) => {
	//

	const strs = str.toLowerCase();

	const replaced = spacedReplace(strs, DASH_REGEX, DASH_REPLACEMENTS);

	const result = replaced
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9-]/g, "_")
		.replace(/-+/g, "-")
		.replace(/_+/g, "_")
		.replace(/^[-_]|[-_]$/g, "");

	return result || "unknown";
};

const sanitizeTypeName = (str: string) => {
	//

	const replaced = replace(str, SPECIAL_REGEX, SPECIAL_CHAR_REPLACEMENTS);

	const pascalized = pascalize(replaced);

	const result = pascalized.replace(/[^a-zA-Z0-9]/g, "");
	if (!result) return "Unknown";

	const ready = /^\d/.test(result) ? `_${result}` : result;

	const safeName = createSafeName(ready);

	return safeName;
};

const sanitizeConstant = <const TName extends string>(str: TName): Uppercase<TName> => {
	//

	const replaced = spacedReplace(str, SPECIAL_REGEX, SPECIAL_CHAR_REPLACEMENTS);

	const cleaned = replaced
		.replace(/\s+/g, "_")
		.replace(/[^a-zA-Z0-9_$]/g, "_")
		.replace(/_+/g, "_")
		.replace(/^_|_$/g, "");

	if (!cleaned) {
		return "UNKNOWN" as Uppercase<TName>;
	}

	const safeName = /^\d/.test(cleaned) ? `_${cleaned}` : cleaned;

	return toUpperCase(safeName as TName);
};

const sanitizeVarName = <const TName extends string>(str: TName) => {
	//

	const replaced = spacedReplace(str, SPECIAL_REGEX, SPECIAL_CHAR_REPLACEMENTS);

	const prevResult = replaced
		.replace(/\s+/g, "_")
		.replace(/[^a-zA-Z0-9_$]/g, "_")
		.replace(/_+/g, "_")
		.replace(/^_|_$/g, "");

	const result = prevResult.toLowerCase();

	if (!result) return "_unknown" as const;
	return /^\d/.test(result) ? (`_${result}` as const) : result;
};

type NormalizedName<TName extends string = string> = {
	name: TName;
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
		name,
		varName: sanitizeVarName(name),
		varNameCamel: toCamelCase(sanitizeVarName(name)),
		typeName: sanitizeTypeName(name),
		fileName: sanitizeFileName(name),
		constant: sanitizeConstant(name),
	} as const;
};

export { normalizeName };
export type { NormalizedName, NormalizeName };
