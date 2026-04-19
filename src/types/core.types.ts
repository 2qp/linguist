type Basis = "committed" | "working-tree" | "all-changes";
type Phase = "generate" | "transform";
type Role = "primary" | "secondary";
type Task = "common" | "usage";

type CoreConfig = {
	url: string;
	name: string;
	build_info_path: string;
	basis: Basis;
};

type CoreConfigFile = {
	core: CoreConfig;
};

export type { CoreConfig, CoreConfigFile, Phase, Role, Task };
