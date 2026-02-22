import type { Meta } from "@core/create-meta";
import type { Ref } from "@core/create-reference";
import type { Field } from "@/types/branded.types";
import type { Config } from "@/types/config.types";
import type { FieldAnalysisArray } from "@/types/field.types";
import type { Primitive } from "@/types/gen.types";
import type { LanguageData } from "@/types/lang.types";

type CreatorParams<
	TSource extends LanguageData = LanguageData,
	TField extends string = Field,
	TUnique extends Primitive = Primitive,
> = {
	source: TSource;
	stats: FieldAnalysisArray<TField, TUnique>;
	config: Config;
	ref: Ref;
	meta: Meta;
};

type Creator = <
	TSource extends LanguageData = LanguageData,
	TField extends string = Field,
	TUnique extends Primitive = Primitive,
>(
	params: CreatorParams<TSource, TField, TUnique>,
) => Promise<void>;

export type { CreatorParams, Creator };
