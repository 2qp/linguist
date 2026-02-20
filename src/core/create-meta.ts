import type { Config } from "@/types/config.types";
import type { LanguageData } from "@/types/lang.types";
import type { Ref } from "./create-reference";

type Meta = {
	languageCount: number;
	fieldCount: number;
};

type CreateMetaParams<T extends LanguageData> = {
	config: Config;
	source: T;
	ref: Ref;
};

type CreateMeta = <T extends LanguageData>(params: CreateMetaParams<T>) => Meta;

const createMeta: CreateMeta = ({ source, ref }) => {
	//

	const keys = Object.keys(source);
	const size = ref.uidToField.size;

	return { languageCount: keys.length, fieldCount: size };
};

export { createMeta };
export type { CreateMeta, CreateMetaParams, Meta };
