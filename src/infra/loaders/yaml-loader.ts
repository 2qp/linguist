import { load } from "js-yaml";

import type { LoadOptions } from "js-yaml";

type YamlLoaderParams = {
	str: string;
	options?: LoadOptions;
};

type YamlLoaderType = <R>(params: YamlLoaderParams) => R | undefined;

const yamlLoader: YamlLoaderType = <R>({ str, options }: YamlLoaderParams) => load(str, options) as R;

export { yamlLoader };
export type { YamlLoaderParams, YamlLoaderType };
