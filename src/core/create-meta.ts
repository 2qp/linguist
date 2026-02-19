import type { Config } from "@/types/config.types";
import type { LanguageData } from "@/types/lang.types";

type Meta = {
	length: number;
};

type CreateMetaParams<T extends LanguageData> = {
	config: Config;
	source: T;
};

type CreateMeta = <T extends LanguageData>(params: CreateMetaParams<T>) => Meta;

const createMeta: CreateMeta = ({ source }) => {
	//

	const keys = Object.keys(source);

	return { length: keys.length };
};

export { createMeta };
export type { CreateMeta, CreateMetaParams, Meta };
