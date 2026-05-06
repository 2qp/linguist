// type GetLangByExtensionParams<T> = {
// 	// ext: LooseToStrict<Extensions[number]>;
// 	ext: T;
// };

import type { OneOptions } from "@/types/accessors.types";
import type { Explicit } from "@/types/utility.types";

// type GetOneOverloaded = {
// 	<T extends keyof ByExtension>(index: ByExtension, ext: T, _?: "ext"): ByExtension[T];
// 	<T extends keyof ById>(index: ById, id: T, _?: "id"): ById[T];
// 	<T extends keyof LanguageToCategory>(index: LanguageToCategory, lang: T, _?: "lng_cat"): LanguageToCategory[T];

// 	<T extends string>(index: ByExtension, ext: T, _?: "ext"): ToObjOne<ByExtension, T, Language[]>;
// 	<T extends string>(index: ById, id: T, _?: "id"): ToObjOne<ById, T, Language[]>;
// 	<T extends string>(index: LanguageToCategory, lang: T, _?: "lng_cat"): ToObjOne<LanguageToCategory, T, Type>;
// };

type GetOneOverloaded = {
	<const I, T extends keyof I>(registry: I, key: T): I[T];

	// <I, T extends string>(index: I, ext: T): ToObjOne<I, T, CombinedPropsFromAny<I>>;

	// options?: OneOptions<undefined>
	<const I, T extends string>(registry: I, key: T): I[keyof I] | undefined;

	<const I extends Record<string, unknown>, T extends keyof Explicit<I>>(
		registry: I,
		key: T,
		options: OneOptions<"known">,
	): I[T];
};

type GetOneType = GetOneOverloaded;

const getOne: GetOneType = (registry: Record<string, unknown>, key: string) => {
	//

	return registry[key as keyof typeof registry];
};

export { getOne };
export type { GetOneType };
