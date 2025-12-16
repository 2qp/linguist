type CoreConfig = {
	url: string;
	name: string;
	build_info_path: string;
};

type CoreConfigFile = {
	core: CoreConfig;
};

export type { CoreConfig, CoreConfigFile };
