import { generateTypes } from "@gen/generate-types";
import { getFile } from "@services/fetch/get-file";
import { buildEntries } from "@utils/build-entries";
import { configLoader } from "@/infra/loaders/config-loader";
import { yamlLoader } from "@/infra/loaders/yaml-loader";
import { writeBuildInfo } from "@/lib/checksum/write-build-info";
import { transform } from "@/transform/transform";

import type { LanguageData } from "@/types/lang.types";

// type GenerateParams = {};

type GenerateType = () => Promise<void>;

const generate: GenerateType = async () => {
	//

	const config = await configLoader();

	const yamlArrBuffer = await getFile<ArrayBuffer>(config.core.url, "arrayBuffer");
	const yamlBuffer = Buffer.from(yamlArrBuffer);
	const yamlStr = yamlBuffer.toString("utf-8");

	const data = yamlLoader<LanguageData>({ str: yamlStr });
	if (!data) throw Error("Unable load yaml data");

	const source = buildEntries({ source: data });

	await generateTypes({ source, config });
	await transform({ source, config });

	await writeBuildInfo({ buffer: yamlBuffer, config });
};

export { generate };
export type { GenerateType };
