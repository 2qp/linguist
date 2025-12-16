import { yamlLoader } from "./yaml-loader";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { Config } from "@/types/config.types";
import type { CoreConfigFile } from "@/types/core.types";
import type { TypeGenConfigFile } from "@/types/gen-config.types";

// type ConfigLoaderParams = {};

type ConfigLoaderType = () => Promise<Config>;

const configLoader: ConfigLoaderType = async () => {
	//

	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);

	const path = join(__dirname, "..", "..", "config");

	const corePath = join(path, "core.config.yaml");
	const typeGenPath = join(path, "type.config.yaml");

	const coreFile = await readFile(corePath, "utf8");
	const typeGenFile = await readFile(typeGenPath, "utf8");

	const core = yamlLoader<CoreConfigFile>({ str: coreFile });
	const typegen = yamlLoader<TypeGenConfigFile>({ str: typeGenFile });

	if (!core) throw Error("Unable to load core config");
	if (!typegen) throw Error("Unable to load typegen config");

	return { ...core, ...typegen };
};

export { configLoader };
export type { ConfigLoaderType };
