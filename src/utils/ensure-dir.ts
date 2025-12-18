import { mkdir } from "node:fs/promises";

// type EnsureDirParams = {};

type EnsureDirType = (dirPath: string) => Promise<void>;

const ensureDir: EnsureDirType = async (dirPath) => {
	//

	try {
		await mkdir(dirPath, { recursive: true });
	} catch (error: unknown) {
		if (error instanceof Error && (error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
	}
};

export { ensureDir };
export type { EnsureDirType };
