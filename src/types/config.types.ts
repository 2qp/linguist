import type { CoreConfigFile } from "./core.types";
import type { TypeGenConfigFile } from "./gen-config.types";

type Config = CoreConfigFile & TypeGenConfigFile;

export type { Config };
