import { ensureDir } from "./ensure-dir";
import { writeFile as writeFileAsync } from "node:fs/promises";
import { dirname } from "node:path";

type WriteFileArgs = Parameters<typeof writeFileAsync>;

type WriteFileParams = {
	filePath: string;
	content: WriteFileArgs[1];
	options?: WriteFileArgs[2];
};

type WriteFileType = (params: WriteFileParams) => Promise<void>;

const writeFile: WriteFileType = async ({ content, filePath, options = "utf-8" }) => {
	//

	await ensureDir(dirname(filePath));
	await writeFileAsync(filePath, content, options);
};

export { writeFile };
export type { WriteFileParams, WriteFileType };
