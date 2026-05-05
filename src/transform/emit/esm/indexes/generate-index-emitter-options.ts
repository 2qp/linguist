import { emitDynamicIndex } from "./emit-dynamic-index";
import { emitIndex } from "./emit-index";
import { emitLazyIndex } from "./emit-lazy-index";

import type { Language } from "@/types/generated.types";
import type { IndexEmitter, IndexEmitterOptions } from "./types";

type GenerateIndexEmitterOptionsParams = {};

type GenerateIndexEmitterOptions = (
	fields: (keyof Language)[],
	UNIQUE_FIELDS: Set<keyof Language>,
) => Generator<IndexEmitter<IndexEmitterOptions>, void, unknown>;

const generateIndexEmitterOptions: GenerateIndexEmitterOptions = function* (fields, UNIQUE_FIELDS) {
	//

	for (const source of fields) {
		//

		const isSourceUnique = UNIQUE_FIELDS.has(source);

		yield* [
			{
				name: `by-${String(source)}`,
				emitter: emitIndex,
				type: "eager",
				options: isSourceUnique
					? { kind: "primitive", key: source, value: "name" }
					: { kind: "set", left: source, right: "name" },
			},
			{
				name: `lazy-by-${String(source)}`,
				emitter: emitLazyIndex,
				type: "lazy",
				options: isSourceUnique
					? { kind: "primitive", key: source, value: "name" }
					: { kind: "set", left: source, right: "name" },
			},
			{
				name: `dynamic-by-${String(source)}`,
				emitter: emitDynamicIndex,
				type: "lazy",
				meta: false,
				options: isSourceUnique
					? { kind: "primitive", key: source, value: "name" }
					: { kind: "set", left: source, right: "name" },
			},
		];
	}
};

export { generateIndexEmitterOptions };
export type { GenerateIndexEmitterOptions, GenerateIndexEmitterOptionsParams };
