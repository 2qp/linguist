import type { BuildParams } from "@/transform/utils/build-map";
import type { NormalizedName } from "@/transform/utils/normalize-name";
import type { Config } from "@/types/config.types";
import type { ProcessedFieldAnalysisArray } from "@/types/field.types";
import type { Language, Languages } from "@/types/generated.types";

type ManifestEmitterParams<TOptions> = {
	languages: Languages;
	config: Config;
	options: TOptions;
	name: string;
	stats: ProcessedFieldAnalysisArray<keyof Language>;
};

type ManifestEmitterType<TOptions> = (params: ManifestEmitterParams<TOptions>) => {
	content: string;
	norm: NormalizedName;
};

type ManifestEmitter<TOptions> = { name: string; emitter: ManifestEmitterType<TOptions>; options: TOptions };

type ManifestEmitterOptions = {} & BuildParams<Languages>;

export type { ManifestEmitterParams, ManifestEmitterType, ManifestEmitter, ManifestEmitterOptions };
