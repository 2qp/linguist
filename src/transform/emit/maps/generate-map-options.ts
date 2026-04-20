import { emitMap } from "./emit-map";

import type { Language } from "@/types/generated.types";
import type { MapEmitter, MapEmitterOptions } from "./types";

// type GenerateMapOptionsParams = {};

type GenerateMapOptions = (
	fields: (keyof Language)[],
	UNIQUE_FIELDS: Set<keyof Language>,
) => Generator<MapEmitter<MapEmitterOptions>, void, unknown>;

const generateMapOptions: GenerateMapOptions = function* (fields, UNIQUE_FIELDS) {
	//

	for (const source of fields) {
		const isSourceUnique = UNIQUE_FIELDS.has(source);

		for (const target of fields) {
			if (source === target) continue;

			yield {
				name: `${source}-to-${target}`,
				emitter: emitMap,
				options: isSourceUnique
					? { kind: "primitive", key: source, value: target }
					: { kind: "set", left: source, right: target },
			};
		}
	}
};

export { generateMapOptions };
export type { GenerateMapOptions };
