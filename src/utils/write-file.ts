import { ensureDir } from "./ensure-dir";
import { writeFile as writeFileAsync } from "node:fs/promises";
import { dirname } from "node:path";

type WriteFileParams = { filePath: string; content: string; options: Parameters<typeof writeFileAsync>["2"] };

type WriteFileType = (params: WriteFileParams) => Promise<void>;

const writeFile: WriteFileType = async ({ content, filePath, options = "utf-8" }) => {
	//

	await ensureDir(dirname(filePath));
	await writeFileAsync(filePath, content, options);
};

export { writeFile };
export type { WriteFileParams, WriteFileType };
