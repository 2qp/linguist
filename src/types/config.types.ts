import type { CoreConfigFile } from "./core.types";
import type { DataConfigFile } from "./data.types";
import type { TypeGenConfigFile } from "./gen-config.types";

type Config = CoreConfigFile & TypeGenConfigFile & DataConfigFile;

export type { Config };
