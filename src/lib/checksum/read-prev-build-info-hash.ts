import { readFile } from "node:fs/promises";

import type { BuildInfo } from "@/types/build.types";

const readPrevBuildInfoHash = async (path: string): Promise<string | null> => {
	try {
		const fileStr = await readFile(path, "utf8");
		const json: BuildInfo = JSON.parse(fileStr);
		return json.hash;
	} catch (err) {
		if (err instanceof Error && (err as NodeJS.ErrnoException)?.code !== "ENOENT") throw err;
		return null;
	}
};

export { readPrevBuildInfoHash };
