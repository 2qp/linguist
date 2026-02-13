import { createElementType } from "@core/create-element-type";
import { createSegmentDefs } from "@core/create-segment-defs";
import { createSegmentRefs } from "@core/create-segment-refs";
import { getArrayTypeString } from "@core/get-array-type-string";
import { chunkArray } from "@utils/chunk-array";
import { join } from "@utils/join";
import { replacer } from "@utils/replacer";
import { shouldSplitTypes } from "@utils/should-split-types";
import { sortMixed } from "@utils/sort";

import type { Config } from "@/types/config.types";
import type { GeneratedDefs } from "@/types/def.types";
import type { ElementBase, FieldAnalysis } from "@/types/field.types";
import type { Primitive } from "@/types/gen.types";

type GenerateLiteralTypeParams<T extends Primitive, TBase extends ElementBase, TName extends string> = {
	stats: FieldAnalysis<T>;
	baseType: TBase;
	typeName?: TName | undefined;
	config: Config;
};

type GenerateLiteralTypeType = <T extends Primitive, TBase extends ElementBase, TName extends string>(
	params: GenerateLiteralTypeParams<T, TBase, TName>,
) => GeneratedDefs<T, TName, TBase>;

const generateLiteralType: GenerateLiteralTypeType = ({ baseType, config, stats, typeName = undefined }) => {
	//

	const filteredValues = [...stats.uniqueValues].filter((v) => typeof v === baseType);

	const sortedValues = sortMixed(filteredValues);

	//
	if (sortedValues.length === 0) {
		const elementType = baseType;

		const typeDef = getArrayTypeString({ elementType, readonly: config.type.useReadonlyArrays });

		return {
			typeDef,
			segmentDefs: [],
			type: stats.type,
		};
	}

	const shouldSplit = shouldSplitTypes(config, sortedValues) && typeName;

	if (!shouldSplit) {
		//

		const literals = sortedValues.map((values) => {
			const template = `${values}` as const;

			const escapedQuotes = replacer(template, '"' as const, '\\"' as const);
			const escapedQuotesAndNewlines = replacer(escapedQuotes, "\n" as const, "\\n" as const);

			return `"${escapedQuotesAndNewlines}"` as const;
		});

		const joinedLits = join(literals, " | " as const);

		const typeDef = createElementType({ combined: joinedLits, base: baseType, config });

		return {
			typeDef,
			segmentDefs: [],
			type: stats.type,
		};
	}

	const chunks = chunkArray(sortedValues, config.type.itemsPerSegment);

	const segmentDefs = createSegmentDefs({ chunks, typeName });
	const segmentRefs = createSegmentRefs({ chunks, typeName });

	const combinedType = join(segmentRefs, " | " as const);

	const typeDef = createElementType({ combined: combinedType, base: baseType, config });

	// const typeDef = getArrayTypeString({ elementType, readonly: config.allowFlexibleTypes });

	return {
		typeDef,
		segmentDefs,
		type: stats.type,
	};
};

export { generateLiteralType };
export type { GenerateLiteralTypeParams, GenerateLiteralTypeType };
