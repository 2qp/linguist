import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { bumpVersion } from "@utils/bump-version";
import { createYamlDiff } from "@utils/create-yaml-diff";
import { log } from "@utils/log";
import { writeFile } from "@utils/write-file";
import { ANSI_COLORS } from "@/constants/ansi-colors";

type CreateChangelogParams = {
	upstreamBuffer: Buffer<ArrayBuffer>;
	baselinePath: string;
	changelogPath: string;
	tempChangelogPath: string;
};

type CreateChangelog = (params: CreateChangelogParams) => Promise<void>;

const createChangelog: CreateChangelog = async ({ upstreamBuffer, baselinePath, changelogPath, tempChangelogPath }) => {
	//

	const [prevStr, pkgStr, existing] = await Promise.all([
		readFile(baselinePath, "utf-8"),
		readFile("./package.json", "utf-8"),
		readFile(changelogPath, "utf-8").catch(() => ""),
	]);

	const diff = createYamlDiff(prevStr, upstreamBuffer.toString("utf-8"));

	if (!diff.length) return;

	const today = new Date();
	const formatted = today.toISOString().split("T")[0];

	const pkg = JSON.parse(pkgStr);
	const pkgVersion = bumpVersion(pkg.version);

	const content = [`## [${pkgVersion}] - ${formatted}`, "", ...diff, "---", "\n"].join("\n");

	const prepended = content + existing;

	await Promise.all([
		writeFile({ content: prepended, filePath: changelogPath }),
		writeFile({ content: diff.join("\n"), filePath: tempChangelogPath }),
	]);

	log.info(`${ANSI_COLORS.fg.green}\u2192${ANSI_COLORS.reset} ${basename(changelogPath)} updated`);
};

export { createChangelog };
export type { CreateChangelogParams, CreateChangelog };
