import { writeFile } from "node:fs/promises";
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

	await writeFile(path, stringify(build, undefined, 2), "utf8");
};

export { writeBuildInfo };
export type { WriteBuildInfoParams, WriteBuildInfo };
