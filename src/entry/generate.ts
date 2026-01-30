import { generateTypes } from "@gen/generate-types";
import { hasRemoteYamlOrConfigChanged } from "@/lib/checksum/has-remote-yaml-config-changed";
import { writeBuildInfo } from "@/lib/checksum/write-build-info";
import { transform } from "@/transform/transform";

// type GenerateParams = {};

type GenerateType = () => Promise<void>;

const generate: GenerateType = async () => {
	//

	const buildInfo = await hasRemoteYamlOrConfigChanged();

	if (!buildInfo.changed) return;

	await generateTypes({});
	await transform({});

	await writeBuildInfo(buildInfo.build.hash, buildInfo.build.source);
};

export { generate };
export type { GenerateType };
