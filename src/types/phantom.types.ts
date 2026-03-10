import type { Phase } from "./core.types";

type WithPhase<P extends Phase> = { _phase: P & {} };

type WithVariant<U, K extends U> = { _variant: K & {} };

export type { WithPhase, WithVariant };
