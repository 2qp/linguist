import { basename } from "node:path";
import { log } from "@utils/log";
import { writeFile } from "@utils/write-file";
import { ANSI_COLORS } from "@/constants/ansi-colors";

type CreateUpstreamBaselineParams = {
	upstreamBuffer: Buffer<ArrayBuffer>;
	baselinePath: string;
};

type CreateUpstreamBaseline = (params: CreateUpstreamBaselineParams) => Promise<void>;

const createUpstreamBaseline: CreateUpstreamBaseline = async ({ upstreamBuffer, baselinePath }) => {
	//

	await writeFile({ content: upstreamBuffer, filePath: baselinePath });

	log.info(`${ANSI_COLORS.fg.green}\u2192${ANSI_COLORS.reset} ${basename(baselinePath)} updated`);
};

export { createUpstreamBaseline };
export type { CreateUpstreamBaselineParams, CreateUpstreamBaseline };
