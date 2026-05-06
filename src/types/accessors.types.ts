type KeyMode = "known" | "hybrid" | "loose";

type OneOptions<M extends KeyMode> = {
	/** `"known"` */
	key?: M;
};

type ManyOptions<M extends KeyMode> = {
	/** `"known" | "hybrid" | "loose"` */
	keys?: M;
};

export type { KeyMode, ManyOptions, OneOptions };
