import type { GeneratedDefs } from "./def.types";
import type { LanguageName } from "./identifiers.types";

type OutputDefs = GeneratedDefs<string, LanguageName | `${string}`>;

type OutputMap = Map<string, OutputDefs>;

export type { OutputDefs, OutputMap };
