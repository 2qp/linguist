import stringify from "safe-stable-stringify";

import type { FlatEmitterType } from "./types";

const emitJSONFlat: FlatEmitterType = ({ languages }) => stringify(languages, null);

export { emitJSONFlat };
