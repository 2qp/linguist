import type { BuildParams } from "@/transform/utils/build-map";
import type { Languages } from "@/types/generated.types";

type ManifestEmitterParams = {};

type ManifestEmitterType = (params: ManifestEmitterParams) => void;

type ManifestEmitter = { name: string; config: BuildParams<Languages> };

export type { ManifestEmitterParams, ManifestEmitterType, ManifestEmitter };
