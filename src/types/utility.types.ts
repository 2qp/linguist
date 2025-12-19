type Entries<T> = {
	[K in keyof T]: [K, T[K]];
}[keyof T][];

type LooseToStrict<T> = T extends unknown ? (string extends T ? never : T) : never;

export type { Entries, LooseToStrict };
