// type IsShadowingGlobalParams = {};

type GlobalName = keyof typeof globalThis;

type IsShadowingGlobal = (name: string) => name is GlobalName;

const isShadowingGlobal: IsShadowingGlobal = (name): name is GlobalName => {
	//

	const GLOBAL_NAMES: ReadonlySet<string> = (() => {
		const collect = (obj: object | null): string[] =>
			obj === null ? [] : [...Object.getOwnPropertyNames(obj), ...collect(Object.getPrototypeOf(obj))];

		return new Set(collect(globalThis));
	})();

	return GLOBAL_NAMES.has(name);
};

export { isShadowingGlobal };
export type { GlobalName, IsShadowingGlobal };
