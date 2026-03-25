import { load } from "js-yaml";
import { stringify } from "safe-stable-stringify";

type ChangeType = "ADDED" | "REMOVED" | "UPDATED";

type Change = {
	path: string;
	value?: unknown;
	oldValue?: unknown;
	newValue?: unknown;
	type: ChangeType;
};

const isJsonObjectOrArray = (str: string = ""): boolean => {
	try {
		const parsed = JSON.parse(str);
		return typeof parsed === "object" && parsed !== null;
	} catch {
		return false;
	}
};

const wrap = (c: string = "") => {
	//

	const json = isJsonObjectOrArray(c);

	if (json)
		return `\`\`\`json
${c}
\`\`\``;

	return `\`${c}\``;
};

const formatDiff = (changes: Change[]): string[] => {
	//

	const grouped = new Map<string, Change[]>();

	for (const change of changes) {
		const root = change.path.split(".")[0] || "General";

		if (!grouped.has(root)) grouped.set(root, []);

		const exist = grouped.get(root) ?? [];

		grouped.set(root, [...exist, change]);
	}

	const output: string[] = [];

	const sortedContexts = Array.from(grouped.keys()).sort();

	for (const context of sortedContexts) {
		const contextChanges = grouped.get(context);

		output.push(`#### ${context}`);

		for (const c of contextChanges ?? []) {
			const subPath = c.path.includes(".") ? c.path.substring(c.path.indexOf(".") + 1) : "";

			const p = subPath ? `"${subPath}"` : "root";
			const indent = "- ";

			switch (c.type) {
				case "ADDED":
					output.push(`${indent}[+] ADDED   : ${p} -> \n${wrap(stringify(c.value))}`);
					break;
				case "REMOVED":
					output.push(`${indent}[-] REMOVED : ${p} -> (was \n${wrap(stringify(c.value))})`);
					break;
				case "UPDATED":
					output.push(
						`${indent}[*] CHANGED : ${p} from \n${wrap(stringify(c.oldValue))} to \n${wrap(stringify(c.newValue))}`,
					);
					break;
			}
		}

		output.push("");
	}

	return output;
};

const createYamlDiff = (oldRaw: string, newRaw: string): string[] => {
	//

	const oldDoc = load(oldRaw);
	const newDoc = load(newRaw);

	const changes: Change[] = [];

	const compare = (obj1: unknown, obj2: unknown, path = "") => {
		//

		//
		if (Array.isArray(obj1) && Array.isArray(obj2)) {
			const oldSet = new Set(obj1.map((i) => stringify(i)));
			const newSet = new Set(obj2.map((i) => stringify(i)));

			for (const item of obj2) {
				if (!oldSet.has(stringify(item))) {
					changes.push({ path, value: item, type: "ADDED" });
				}
			}

			for (const item of obj1) {
				if (!newSet.has(stringify(item))) {
					changes.push({ path, value: item, type: "REMOVED" });
				}
			}

			return;
		}

		//
		if (typeof obj1 === "object" && obj1 !== null && typeof obj2 === "object" && obj2 !== null) {
			const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

			for (const key of allKeys) {
				compare(obj1[key as keyof typeof obj1], obj2[key as keyof typeof obj2], path ? `${path}.${key}` : key);
			}

			return;
		}

		//
		if (obj1 === obj2) return;

		if (obj1 === undefined) {
			changes.push({ path, value: obj2, type: "ADDED" });
			return;
		}

		if (obj2 === undefined) {
			changes.push({ path, value: obj1, type: "REMOVED" });
			return;
		}

		changes.push({ path, oldValue: obj1, newValue: obj2, type: "UPDATED" });
	};

	compare(oldDoc, newDoc);

	return formatDiff(changes);
};

export { createYamlDiff };
