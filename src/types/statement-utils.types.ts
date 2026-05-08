import type { wrap } from "@/transform/utils/statement/statement-builder-utils";
import type { Wrapper } from "./statement.types";
import type { ReverseTuple } from "./utility.types";

type WrapEach<T extends readonly unknown[], W extends Wrapper> = {
	[K in keyof T]: T[K] extends string ? ReturnType<typeof wrap<T[K], W>> : never;
};

type ReverseWrapTuple<T extends string, W extends Wrapper, A extends readonly (readonly [T, W])[]> = ReverseTuple<{
	[K in keyof A]: A[K] extends readonly [infer Item extends T, infer Wrap extends W]
		? ReturnType<typeof wrap<Item, Wrap>>
		: never;
}>;

export type { ReverseWrapTuple, WrapEach };
