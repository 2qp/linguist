import type { FlatEmitterType } from "./types";

const emitJSONFlat: FlatEmitterType = ({ languages }) => JSON.stringify(languages, null, 2);

export { emitJSONFlat };
