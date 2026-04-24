import { isNotNullish, isNullish } from "./guards";
import { parseExpression } from "@babel/parser";

import type { Node } from "@babel/types";

type ParsedValue =
	| { type: "string"; value: string }
	| { type: "identifier"; value: string }
	| { type: "number"; value: number }
	| { type: "array"; value: ParsedValue[] }
	| { type: "object"; value: Record<string, ParsedValue> }
	| { type: "expression"; value: string };

const extractObjectText = (input: string) => {
	const match = input.match(/{[\s\S]*}/);
	if (!match) throw new Error("No object found");
	return match[0];
};

const getNodeSource = (text: string, start?: number | null, end?: number | null): string | null => {
	if (isNullish(start) || isNullish(end)) return null;
	const source = text.slice(start, end);
	return source.replace(/\s+/g, " ").trim();
};

const parseObject = (input: string): Record<string, ParsedValue> => {
	//

	const objText = extractObjectText(input);

	const ast = parseExpression(objText, {
		sourceType: "module",
		plugins: ["typescript", "jsx"],
	});

	const result: Record<string, ParsedValue> = {};

	const getValue = (node: Node): ParsedValue => {
		//

		if (node.type === "StringLiteral") {
			return { type: "string", value: node.value };
		}

		if (node.type === "NumericLiteral") {
			return { type: "number", value: node.value };
		}

		if (node.type === "Identifier") {
			return { type: "identifier", value: node.name };
		}

		if (node.type === "ArrayExpression") {
			return {
				type: "array",
				value: node.elements.map((element) => getValue(element as Node)),
			};
		}

		if (node.type === "ObjectExpression") {
			const obj: Record<string, ParsedValue> = {};

			for (const prop of node.properties) {
				if (prop.type === "ObjectProperty" && prop.key.type === "StringLiteral") {
					obj[prop.key.value] = getValue(prop.value);
				}
			}

			return { type: "object", value: obj };
		}

		const start = node.start ?? undefined;
		const end = node.end ?? undefined;

		if (isNotNullish(start) && isNotNullish(end)) {
			const source = getNodeSource(objText, start, end);
			return { type: "expression", value: source || "" };
		}

		return { type: "expression", value: "" };
	};

	if (ast.type === "ObjectExpression") {
		for (const prop of ast.properties) {
			if (prop.type === "ObjectProperty" && prop.key.type === "StringLiteral") {
				const key = prop.key.value;
				result[key] = getValue(prop.value);
			}
		}
	}

	return result;
};

const truncatePath = (path: string, maxLength = 40, keepSegments = 1): string => {
	//

	if (path.length <= maxLength) return path;

	const segments = path.split("/");

	// segments
	if (segments.length > keepSegments + 1) {
		const kept = segments.slice(-keepSegments);
		const result = `…/${kept.join("/")}`;

		// last segment chars
		if (result.length > maxLength && kept.length > 0) {
			const lastSegment = kept[kept.length - 1];
			const otherSegments = kept.slice(0, -1);
			const availableForLast = maxLength - (result.length - (lastSegment?.length ?? 0)) - 3;
			const truncatedLast = `${lastSegment?.slice(0, Math.max(1, availableForLast)) ?? ""}…`;
			const finalPath = [...otherSegments, truncatedLast].join("/");
			return `…/${finalPath}`;
		}

		return result;
	}

	//
	return `…${path.slice(-maxLength + 3)}`;
};

const formatParsedValue = (value: ParsedValue, maxItems = 2): string => {
	//

	switch (value.type) {
		case "string": {
			const str = value.value;
			if (str.length > 60) return `"${str.slice(0, 57)}…"`;
			return `"${str}"`;
		}

		case "identifier": {
			const id = value.value;
			if (id.length > 60) return `${id.slice(0, 57)}…`;
			return id;
		}

		case "number":
			return String(value.value);

		case "array": {
			const arrayContent = value.value
				.slice(0, maxItems)
				.map((item) => formatParsedValue(item, maxItems))
				.join(", ");

			if (value.value.length > maxItems) {
				return `[ ${arrayContent}, … ]`;
			}
			return `[ ${arrayContent} ]`;
		}

		case "object": {
			const entries = Object.entries(value.value);
			const preview = entries.slice(0, 2).map(([key, val]) => {
				const formattedKey = /^\d+$/.test(key) ? key : `"${key}"`;
				const formattedVal = formatParsedValue(val, maxItems);
				return `${formattedKey}: ${formattedVal}`;
			});
			const hasMore = entries.length > 2;
			return `{ ${preview.join(", ")}${hasMore ? ", …" : ""} }`;
		}

		case "expression": {
			const expr = value.value;

			const isPromiseAllString = (str: string): boolean => {
				return str.includes("Promise.all") || str.includes("import(");
			};

			const processedExpr = isPromiseAllString(expr)
				? expr.replace(/import\('([^']+)'\)/g, (_, path) => {
						const truncated = truncatePath(path);
						return `import('${truncated}')`;
					})
				: expr;

			return processedExpr.length > 80 ? `${processedExpr.slice(0, 77)}…` : processedExpr;
		}

		default:
			return "_";
	}
};

const getPreviewOfObj = (parsedObj: Record<string, ParsedValue>, maxKeys = 2, maxItems = 2): string => {
	//

	const entries = Object.entries(parsedObj);

	const preview = entries.slice(0, maxKeys).map(([key, value]) => {
		const formattedKey = /^\d+$/.test(key) ? key : `"${key}"`;
		const formattedValue = formatParsedValue(value, maxItems);
		return `${formattedKey}: ${formattedValue}`;
	});

	const hasMore = entries.length > maxKeys;

	return `{ ${preview.join(", ")}${hasMore ? ", …" : ""} } as const`;
};

export { getPreviewOfObj, parseObject };
