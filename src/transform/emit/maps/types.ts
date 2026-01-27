import type { Languages } from "@/generated/types/language-types.generated";
import type { Config } from "@/types/config.types";

type MapEmitterParams = { languages: Languages | Readonly<Languages>; config: Config };

type MapEmitterType = (params: MapEmitterParams) => string;

type MapEmitter = { name: string; emitter: MapEmitterType };

export type { MapEmitter, MapEmitterParams, MapEmitterType };
