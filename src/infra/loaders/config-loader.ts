import { yamlLoader } from "./yaml-loader";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { resolvePath } from "@utils/resolve-path";

import type { Config } from "@/types/config.types";
import type { CoreConfigFile } from "@/types/core.types";
import type { DataConfigFile } from "@/types/data.types";
import type { TypeGenConfigFile } from "@/types/gen-config.types";

// type ConfigLoaderParams = {};

type ConfigLoaderType = () => Promise<Config>;

const configLoader: ConfigLoaderType = async () => {
	//

	const path = resolvePath("src/config");

	const corePath = join(path, "core.config.yaml");
	const typeGenPath = join(path, "type.config.yaml");
	const dataPath = join(path, "data.config.yaml");

	const coreFile = await readFile(corePath, "utf8");
	const typeGenFile = await readFile(typeGenPath, "utf8");
	const dataFile = await readFile(dataPath, "utf8");

	const core = yamlLoader<CoreConfigFile>({ str: coreFile });
	const typegen = yamlLoader<TypeGenConfigFile>({ str: typeGenFile });
	const data = yamlLoader<DataConfigFile>({ str: dataFile });

	if (!core) throw Error("Unable to load core config");
	if (!typegen) throw Error("Unable to load typegen config");
	if (!data) throw Error("Unable to load data config");

	return { ...core, ...typegen, ...data };
};

export { configLoader };
export type { ConfigLoaderType };
