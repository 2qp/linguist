import { readFile, writeFile } from "node:fs/promises";
import { hashContent } from "@utils/hash-content";
import { stringify } from "safe-stable-stringify";

import type { BinaryLike } from "node:crypto";
import type { BuildInfo } from "@/types/build.types";
import type { Config } from "@/types/config.types";

type WriteBuildInfoParams = {
	config: Config;
	buffer: BinaryLike;
	path?: string;
};

type WriteBuildInfo = (params: WriteBuildInfoParams) => Promise<void>;

const writeBuildInfo: WriteBuildInfo = async ({ buffer, config, path = "./build-info.json" }) => {
	//

	const hash = hashContent(buffer);

	const build: BuildInfo = {
		source: config.core.url,
		hash,
		generated_at: new Date().toISOString(),
	};

	const existingContent = await readFile(path, "utf8").catch(() => "{}");
	const existingData: Partial<BuildInfo> = JSON.parse(existingContent);

	const updatedBuildInfo = {
		...existingData,
		...build,
		// created_at: existingData.created_at,
		// history: [...(existingData.history || [])],
	};

	await writeFile(path, stringify(updatedBuildInfo, undefined, 2), "utf8");
};

export { writeBuildInfo };
export type { WriteBuildInfo, WriteBuildInfoParams };
