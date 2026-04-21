import type { BuildParams, BuildVariant } from "@/transform/utils/build-map";
import type { NormalizedName } from "@/transform/utils/normalize-name";
import type { Config } from "@/types/config.types";
import type { ProcessedFieldAnalysisArray } from "@/types/field.types";
import type { Language, Languages } from "@/types/generated.types";
import type { KeysOfUnion } from "@/types/utility.types";

type IndexEmitterParams<TOptions> = {
	languages: Languages;
	config: Config;
	options: TOptions;
	name: string;
	stats: ProcessedFieldAnalysisArray<keyof Language>;
};

type IndexEmitterType<TOptions> = (params: IndexEmitterParams<TOptions>) => { norm: NormalizedName; content: string };

type IndexEmitter<TOptions> = { name: string; emitter: IndexEmitterType<TOptions>; options: TOptions };

type IndexEmitterOptions = {} & BuildParams<Languages, BuildVariant, KeysOfUnion<Languages[keyof Languages]>, "name">;

export type { IndexEmitter, IndexEmitterOptions, IndexEmitterType };
