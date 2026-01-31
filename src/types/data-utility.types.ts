type ToTuple<T, K extends readonly (keyof T | (string & {}))[], R = never> = {
	[I in keyof K]: K[I] extends keyof T ? T[K[I]] : R;
};

type ToObj<T, K extends readonly (keyof T | (string & {}))[], R = never> = {
	[I in K[number]]: I extends keyof T ? T[I] : R;
};

type ToObjOne<T, K extends keyof T | (string & {}), R = never> = K extends keyof T ? T[K] : R;

type ExtractMainExport<T> = {
	[K in keyof T]: T[K] extends ((...args: unknown[]) => unknown) | object | string | number | boolean ? T[K] : never;
}[keyof T];

type ProcessWithExporter<Tuple extends unknown[], R = never> = {
	[I in keyof Tuple]: Tuple[I] extends unknown[]
		? ProcessWithExporter<Tuple[I]>
		: Tuple[I] extends infer Module
			? ExtractMainExport<Module> extends ExtractMainExport<R>
				? R
				: ExtractMainExport<Module>
			: never;
};

type ProcessWithAwaited<Tuple extends unknown[]> = {
	[I in keyof Tuple]: Tuple[I] extends (...args: unknown[]) => unknown ? Awaited<ReturnType<Tuple[I]>> : Tuple[I];
};

type ProcessLazyTuple<T, K extends (keyof T | (string & {}))[], R = never> = ProcessWithExporter<
	ProcessWithAwaited<ToTuple<T, K, R>>,
	R
>;

type AwaitedReturnOrSelf<T> = T extends (...args: unknown[]) => unknown ? Awaited<ReturnType<T>> : T;

type SyncOrAsyncFn<T = unknown> = (() => T) | (() => Promise<T>);

export type {
	AwaitedReturnOrSelf,
	ExtractMainExport,
	ProcessLazyTuple,
	ProcessWithAwaited,
	ProcessWithExporter,
	SyncOrAsyncFn,
	ToObj,
	ToObjOne,
	ToTuple,
};
