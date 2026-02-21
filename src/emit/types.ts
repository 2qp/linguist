import type { Meta } from "@core/create-meta";
import type { Ref } from "@core/create-reference";
import type { ProcessFieldsReturnType } from "@gen/utils/process-fields";
import type { Field } from "@/types/branded.types";
import type { Config } from "@/types/config.types";
import type { FieldAnalysisArray } from "@/types/field.types";
import type { Primitive } from "@/types/gen.types";
import type { LanguageData } from "@/types/lang.types";

type EmitterParams<
	TSource extends LanguageData = LanguageData,
	TField extends string = Field,
	TUnique extends Primitive = Primitive,
> = {
	config: Config;
	source: TSource;
	ref: Ref;
	meta: Meta;
	fields: ProcessFieldsReturnType<TField, TUnique>;
	stats: FieldAnalysisArray<TField, TUnique>;
};

type Emitter<R = string[]> = <
	TSource extends LanguageData = LanguageData,
	TField extends string = Field,
	TUnique extends Primitive = Primitive,
>(
	params: EmitterParams<TSource, TField, TUnique>,
) => R;

export type { EmitterParams, Emitter };
