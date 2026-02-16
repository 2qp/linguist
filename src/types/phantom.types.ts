import type { Phase } from "./core.types";

type WithPhase<P extends Phase> = { _phase: P & {} };

export type { WithPhase };
