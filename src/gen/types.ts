import type { Meta } from "@core/create-meta";
import type { Ref } from "@core/create-reference";
import type { Field } from "@/types/branded.types";
import type { Config } from "@/types/config.types";
import type { GeneratedDefs } from "@/types/def.types";
import type { ElementBase, FieldAnalysisArray, ProcessedFieldAnalysis } from "@/types/field.types";
import type { Primitive } from "@/types/gen.types";
import type { LanguageData } from "@/types/lang.types";

type DefsGeneratorParams<
	TName extends string = string,
	TUnique extends Primitive = Primitive,
	TBase extends ElementBase = ElementBase,

	// TField extends string = Field,
	// TSource extends LanguageData = LanguageData,
> = {
	config: Config;
	typeName: TName;
	baseType: TBase;
	stats: ProcessedFieldAnalysis<TUnique>;
	// ref: Ref;
	// meta: Meta;
};

type DefsGeneratorParamsMap<
	TName extends string = string,
	TUnique extends Primitive = Primitive,
	TBase extends ElementBase = ElementBase,
> = {
	no_base: Omit<DefsGeneratorParams<TName, TUnique, TBase>, "baseType">;
	with_base: DefsGeneratorParams<TName, TUnique, TBase>;
};

type DefsGenerator<Config extends keyof DefsGeneratorParamsMap = "with_base"> = <
	TName extends string = string,
	TUnique extends Primitive = Primitive,
	TBase extends ElementBase = ElementBase,

	// TField extends string = Field,
	// TSource extends LanguageData = LanguageData,
>(
	params: DefsGeneratorParamsMap<TName, TUnique, TBase>[Config],
) => GeneratedDefs<TUnique, TName, TBase | ElementBase>;

//

type GeneratorParams<
	TSource extends LanguageData = LanguageData,
	TField extends string = Field,
	TUnique extends Primitive = Primitive,
> = {
	config: Config;
	source: TSource;
	ref: Ref;
	meta: Meta;
	stats: FieldAnalysisArray<TField, TUnique>;
};

type Generator<R = Promise<void>> = <
	TSource extends LanguageData = LanguageData,
	TField extends string = Field,
	TUnique extends Primitive = Primitive,
>(
	params: GeneratorParams<TSource, TField, TUnique>,
) => R;

export type { Generator, GeneratorParams };

export type { DefsGenerator, DefsGeneratorParams };
