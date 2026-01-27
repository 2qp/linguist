import type { EmitManifestConfig } from "./emit-manifest";

type ManifestEmitterParams = {};

type ManifestEmitterType = (params: ManifestEmitterParams) => void;

type ManifestEmitter = { name: string; config: EmitManifestConfig };

export type { ManifestEmitterParams, ManifestEmitterType, ManifestEmitter };
