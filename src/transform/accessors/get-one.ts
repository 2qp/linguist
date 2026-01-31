// type GetLangByExtensionParams<T> = {
// 	// ext: LooseToStrict<Extensions[number]>;
// 	ext: T;
// };

// type GetOneOverloaded = {
// 	<T extends keyof ByExtension>(index: ByExtension, ext: T, _?: "ext"): ByExtension[T];
// 	<T extends keyof ById>(index: ById, id: T, _?: "id"): ById[T];
// 	<T extends keyof LanguageToCategory>(index: LanguageToCategory, lang: T, _?: "lng_cat"): LanguageToCategory[T];

// 	<T extends string>(index: ByExtension, ext: T, _?: "ext"): ToObjOne<ByExtension, T, Language[]>;
// 	<T extends string>(index: ById, id: T, _?: "id"): ToObjOne<ById, T, Language[]>;
// 	<T extends string>(index: LanguageToCategory, lang: T, _?: "lng_cat"): ToObjOne<LanguageToCategory, T, Type>;
// };

type GetOneOverloaded = {
	<I, T extends keyof I>(registry: I, key: T): I[T];

	// <I, T extends string>(index: I, ext: T): ToObjOne<I, T, CombinedPropsFromAny<I>>;

	<I, T extends string>(registry: I, key: T): I[keyof I] | undefined;
};

type GetOneType = GetOneOverloaded;

const getOne: GetOneType = (registry: Record<string, unknown>, key: string) => {
	//

	return registry[key as keyof typeof registry];
};

export { getOne };
export type { GetOneType };
