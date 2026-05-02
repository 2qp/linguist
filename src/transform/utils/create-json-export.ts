import { writeFile } from "@services/fs/write-file";

type CreateJsonExportParams = {
	alias: string;
	sourcePath: string;
	filePath: string;
};

type CreateJsonExportType = (params: CreateJsonExportParams) => Promise<void>;

const createJsonExport: CreateJsonExportType = async ({ alias, sourcePath, filePath }) => {
	const content = `export { default as ${alias} } from "${sourcePath}"` as const;

	await writeFile({ content, filePath });
};

export { createJsonExport };
export type { CreateJsonExportParams, CreateJsonExportType };
