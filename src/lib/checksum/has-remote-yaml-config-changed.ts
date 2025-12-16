import { fetchRemoteYaml } from "./fetch-remote-yaml";
import { readPrevBuildInfoHash } from "./read-prev-build-info-hash";
import { hashContent } from "@utils/hash-content";
import { stringify } from "safe-stable-stringify";
import { configLoader } from "@/infra/loaders/config-loader";
import { yamlLoader } from "@/infra/loaders/yaml-loader";

import type { BuildInfo } from "@/types/build.types";

type HasRemoteYamlOrConfigChangedReturnType =
	| { changed: true; build: Omit<BuildInfo, "generatedAt"> }
	| { changed: false };

type HasRemoteYamlOrConfigChangedType = () => Promise<HasRemoteYamlOrConfigChangedReturnType>;

const hasRemoteYamlOrConfigChanged: HasRemoteYamlOrConfigChangedType = async () => {
	//

	const configObj = await configLoader();
	const yamlStr = await fetchRemoteYaml(configObj.core.url);
	const yamlObj = await yamlLoader({ str: yamlStr });

	const obj = { yamlObj, configObj };

	const currentHash = hashContent(stringify(obj));

	const prevHash = await readPrevBuildInfoHash(configObj.core.build_info_path);

	if (currentHash === prevHash) {
		console.info("🟡 Remote YAML unchanged - skipping build");
		console.info("🟡 Config unchanged - skipping build");
		return { changed: false };
	}

	return { changed: true, build: { hash: currentHash, source: configObj.core.url } };
};

export { hasRemoteYamlOrConfigChanged };
