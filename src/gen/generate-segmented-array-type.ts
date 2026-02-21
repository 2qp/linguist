import { createElementType } from "@core/create-element-type";
import { createSegmentDefs } from "@core/create-segment-defs";
import { createSegmentRefs } from "@core/create-segment-refs";
import { getArrayTypeString } from "@core/get-array-type-string";
import { chunkArray } from "@utils/chunk-array";
import { join } from "@utils/join";
import { sortMixed } from "@utils/sort";

import type { DefsGenerator } from "./types";

type GenerateSegmentedArrayType = DefsGenerator;
const generateSegmentedArrayType: GenerateSegmentedArrayType = ({ stats, baseType, typeName, config }) => {
	//

	const filteredValues = [...stats.uniqueValues].filter((v) => typeof v === baseType);

	const sortedValues = sortMixed(filteredValues);

	if (sortedValues.length === 0) {
		const elementType = baseType;

		const typeDef = getArrayTypeString({ elementType, readonly: config.type.useReadonlyArrays });

		return {
			typeDef,
			segmentDefs: [],
			type: stats.type,
		};
	}

	const chunks = chunkArray(sortedValues, config.type.itemsPerSegment);

	const segmentDefs = createSegmentDefs({ chunks, typeName });

	const segmentRefs = createSegmentRefs({ chunks, typeName });

	const combinedElementType = join(segmentRefs, " | " as const);

	const elementType = createElementType({ combined: combinedElementType, base: baseType, config });

	const typeDef = getArrayTypeString({ elementType, readonly: config.type.useReadonlyArrays });

	return {
		typeDef,
		segmentDefs,
		type: stats.type,
	};
};

export { generateSegmentedArrayType };
export type { GenerateSegmentedArrayType };
