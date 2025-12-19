type ToTuple<T, K extends readonly (keyof T | (string & {}))[]> = {
	[I in keyof K]: K[I] extends keyof T ? T[K[I]] : never;
};

type ExtractMainExport<T> = {
	[K in keyof T]: T[K] extends ((...args: unknown[]) => unknown) | object | string | number | boolean ? T[K] : never;
}[keyof T];

type ProcessWithExporter<Tuple extends unknown[]> = {
	[I in keyof Tuple]: Tuple[I] extends unknown[]
		? ProcessWithExporter<Tuple[I]>
		: Tuple[I] extends infer Module
			? ExtractMainExport<Module>
			: never;
};

type ProcessWithAwaited<Tuple extends unknown[]> = {
	[I in keyof Tuple]: Tuple[I] extends (...args: unknown[]) => unknown ? Awaited<ReturnType<Tuple[I]>> : Tuple[I];
};
type ProcessTuple<T, K extends (keyof T | (string & {}))[]> = ProcessWithExporter<ProcessWithAwaited<ToTuple<T, K>>>;

export type { ExtractMainExport, ProcessTuple, ProcessWithAwaited, ProcessWithExporter, ToTuple };
