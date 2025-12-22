import type { Languages } from "@/generated/types/language-types.generated";
import type { Config } from "@/types/config.types";

type IndexEmitterParams = { languages: Languages | Readonly<Languages>; config: Config };

type IndexEmitterType = (params: IndexEmitterParams) => string;

type IndexEmitter = { name: string; emitter: IndexEmitterType };

export type { IndexEmitterType, IndexEmitter };
