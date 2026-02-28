import type { Config } from "@/types/config.types";

type CreateSecondaryNameParams<TName extends string> = {
	name?: TName | undefined;
	config: Config;
	_prefix?: boolean;
	_suffix?: boolean;
};

const createSecondaryName = <const TPrefix extends string, const TName extends string, const TSuffix extends string>({
	config,
	name = "" as TName,
	_prefix = true,
	_suffix = true,
}: CreateSecondaryNameParams<TName>) => {
	//

	const prefix = (_prefix ? config.type.naming.secondaryPrefix || "" : "") as TPrefix;

	const suffix = (_suffix ? config.type.naming.secondarySuffix || "" : "") as TSuffix;

	return `${prefix}${name}${suffix}` as const;
};

export { createSecondaryName };
export type { CreateSecondaryNameParams };
