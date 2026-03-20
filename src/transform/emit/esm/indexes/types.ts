import type { Config } from "@/types/config.types";
import type { Languages } from "@/types/generated.types";

type IndexEmitterParams = { languages: Languages; config: Config };

type IndexEmitterType = (params: IndexEmitterParams) => string;

type IndexEmitter = { name: string; emitter: IndexEmitterType };

export type { IndexEmitterType, IndexEmitter };
