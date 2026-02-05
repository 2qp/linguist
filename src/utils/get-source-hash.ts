import { execSync } from "node:child_process";

import type { CoreConfig } from "@/types/core.types";

type GetSourceHashParams = CoreConfig["basis"];

type GetSourceHashType = (params: GetSourceHashParams) => string | undefined;

const contentSources = {
	committed: "xargs -I {} git show HEAD:{}",
	"working-tree": "xargs sha1sum",
	"all-changes": "",
} as const satisfies Record<CoreConfig["basis"], string>;

const getSourceHash: GetSourceHashType = (basis) => {
	//

	const include = ["src/", "pnpm-lock.yaml"];
	const exclude = ["src/ui-only-stuff"];

	const includeStr = include.map((p) => `'${p}'`).join(" ");
	const excludeStr = exclude.map((p) => `grep -v '${p}'`).join(" | ");

	// git history or fs
	const contentSource = contentSources[basis];

	if (basis === "all-changes") return `fallback-${Date.now()}`;

	try {
		const cmd = `git ls-files ${includeStr} | ${excludeStr} | ${contentSource} | sha1sum`;
		return execSync(cmd, { encoding: "utf8" }).trim().split(" ")[0];
	} catch (err) {
		console.warn("couldn't generate logic hash (git error). falling back to timestamp. | ", err);
		return `fallback-${Date.now()}`;
	}
};

export { getSourceHash };
export type { GetSourceHashParams, GetSourceHashType };
