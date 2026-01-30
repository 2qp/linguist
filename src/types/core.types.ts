type Basis = "committed" | "working-tree";

type CoreConfig = {
	url: string;
	name: string;
	build_info_path: string;
	basis: Basis;
};

type CoreConfigFile = {
	core: CoreConfig;
};

export type { CoreConfig, CoreConfigFile };
