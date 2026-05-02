import { createChangelog } from "./create-changelog";
import { createUpstreamBaseline } from "./create-upstream-baseline";
import { getFile } from "@services/fetch/get-file";
import { configLoader } from "@/infra/loaders/config-loader";

type CreateUpstreamAndChangelogParams = {};

type CreateUpstreamAndChangelog = (params: CreateUpstreamAndChangelogParams) => Promise<void>;

const createUpstreamAndChangelog: CreateUpstreamAndChangelog = async () => {
	//

	const config = await configLoader();

	const arrayBuffer = await getFile<ArrayBuffer>(config.core.url, "arrayBuffer");
	const upstreamBuffer = Buffer.from(arrayBuffer);

	const baselinePath = `./tests/fixtures/upstream.baseline.yml`;
	const changelogPath = "./CHANGELOG.md";
	const tempChangelogPath = "./changelog.tmp.md";

	await createChangelog({ upstreamBuffer, baselinePath, changelogPath, tempChangelogPath });
	await createUpstreamBaseline({ upstreamBuffer, baselinePath });
};

export { createUpstreamAndChangelog };
export type { CreateUpstreamAndChangelog, CreateUpstreamAndChangelogParams };
