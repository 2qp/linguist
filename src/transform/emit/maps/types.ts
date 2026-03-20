import type { BuildParams } from "@/transform/utils/build-map";
import type { NormalizedName } from "@/transform/utils/normalize-name";
import type { Config } from "@/types/config.types";
import type { ProcessedFieldAnalysisArray } from "@/types/field.types";
import type { Language, Languages } from "@/types/generated.types";

type MapEmitterParams<TOptions> = {
	languages: Languages;
	config: Config;
	options: TOptions;
	name: string;
	stats: ProcessedFieldAnalysisArray<keyof Language>;
};

type MapEmitterType<TOptions> = (params: MapEmitterParams<TOptions>) => { content: string; norm: NormalizedName };

type MapEmitter<TOptions> = { name: string; emitter: MapEmitterType<TOptions>; options: TOptions };

type MapEmitterOptions = {} & BuildParams<Languages>;

export type { MapEmitter, MapEmitterOptions, MapEmitterParams, MapEmitterType };
