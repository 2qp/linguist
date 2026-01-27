import type { Languages } from "@/generated/types/language-types.generated";
import type { Config } from "@/types/config.types";

type FlatEmitterParams = { languages: Languages | Readonly<Languages>; config: Config };

type FlatEmitterType = (params: FlatEmitterParams) => string;

type FlatEmitter = { name: string; emitter: FlatEmitterType; ext?: string };

export type { FlatEmitter, FlatEmitterParams, FlatEmitterType };
