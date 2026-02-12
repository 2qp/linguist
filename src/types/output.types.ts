import type { GeneratedDefs } from "./def.types";
import type { Primitive } from "./gen.types";
import type { LanguageName } from "./identifiers.types";

type OutputDefs<TUnique extends Primitive = Primitive> = GeneratedDefs<TUnique, LanguageName | `${string}`>;

type OutputMap<TUnique extends Primitive = Primitive> = Map<string, OutputDefs<TUnique>>;

export type { OutputDefs, OutputMap };
