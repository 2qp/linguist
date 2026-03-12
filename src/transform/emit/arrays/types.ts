import type { BuildParams } from "@/transform/utils/build-map";
import type { NormalizedName } from "@/transform/utils/normalize-name";
import type { Config } from "@/types/config.types";
import type { ProcessedFieldAnalysis, ProcessedFieldAnalysisArray } from "@/types/field.types";
import type { Language, Languages } from "@/types/generated.types";

type ArrayEmitterParams<TOptions> = {
	languages: Languages;
	config: Config;
	options: TOptions;
	name: string;
	stats: ProcessedFieldAnalysisArray<keyof Language>;
};

type ArrayFieldEmitterOptions = {
	field: keyof Language;
	stats: ProcessedFieldAnalysis;
};

type ArrayEmitterOptions = {} & BuildParams<Languages>;

type ArrayEmitterFn<TOptions> = (params: ArrayEmitterParams<TOptions>) => { content: string; norm: NormalizedName };

type ArrayEmitter<TOptions> = { name: string; emitter: ArrayEmitterFn<TOptions>; options: TOptions };

export type { ArrayEmitter, ArrayEmitterFn, ArrayEmitterOptions, ArrayFieldEmitterOptions };
