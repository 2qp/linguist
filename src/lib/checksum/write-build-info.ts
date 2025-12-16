import { writeFile } from "node:fs/promises";
import { stringify } from "safe-stable-stringify";

import type { BuildInfo } from "@/types/build.types";

const writeBuildInfo = async (hash: string, url: string, path: string) => {
	//

	const build: BuildInfo = {
		source: url,
		hash,
		generatedAt: new Date().toISOString(),
	};

	await writeFile(path, stringify(build, undefined, 2), "utf8");
};

export { writeBuildInfo };
