import type { Config } from "@/types/config.types";
import type { Languages } from "@/types/generated.types";

type FlatEmitterParams = { languages: Languages | Readonly<Languages>; config: Config };

type FlatEmitterType = (params: FlatEmitterParams) => string;

type FlatEmitter = { name: string; emitter: FlatEmitterType; ext?: string };

export type { FlatEmitter, FlatEmitterParams, FlatEmitterType };
