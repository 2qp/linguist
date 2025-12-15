import { createElementType } from "@core/create-element-type";
import { createSegmentDefs } from "@core/create-segment-defs";
import { createSegmentRefs } from "@core/create-segment-refs";
import { getArrayTypeString } from "@core/get-array-type-string";
import { chunkArray } from "@utils/chunk-array";
import { join } from "@utils/join";
import { sortMixed } from "@utils/sort";

import type { Config } from "@/types/config.types";
import type { GeneratedDefs } from "@/types/def.types";
import type { ElementBase } from "@/types/field.types";
import type { Primitive } from "@/types/gen.types";

type GenerateSegmentedArrayTypeParams<T extends Primitive, TBase extends ElementBase, TName extends string> = {
	values: Set<T>;
	baseType: TBase;
	typeName: TName;
	config: Config;
};

type GenerateSegmentedArrayTypeType = <T extends Primitive, TBase extends ElementBase, TName extends string>(
	params: GenerateSegmentedArrayTypeParams<T, TBase, TName>,
) => GeneratedDefs<T, TName, TBase>;

const generateSegmentedArrayType: GenerateSegmentedArrayTypeType = ({ values, baseType, typeName, config }) => {
	//

	const filteredValues = [...values].filter((v) => typeof v === baseType);

	const sortedValues = sortMixed(filteredValues);

	if (sortedValues.length === 0) {
		const elementType = baseType;

		const typeDef = getArrayTypeString({ elementType, readonly: config.type.useReadonlyArrays });

		return {
			typeDef,
			segmentDefs: [],
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
	};
};

export { generateSegmentedArrayType };
export type { GenerateSegmentedArrayTypeParams, GenerateSegmentedArrayTypeType };
