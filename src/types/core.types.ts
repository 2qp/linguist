type Basis = "committed" | "working-tree" | "all-changes";

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
