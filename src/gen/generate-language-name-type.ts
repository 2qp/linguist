import { createElementType } from "@core/create-element-type";
import { createSegmentDefs } from "@core/create-segment-defs";
import { createSegmentRefs } from "@core/create-segment-refs";
import { chunkArray } from "@utils/chunk-array";
import { join } from "@utils/join";
import { replacer } from "@utils/replacer";
import { shouldSplitTypes } from "@utils/should-split-types";
import { sortMixed } from "@utils/sort";

import type { Config } from "@/types/config.types";
import type { GeneratedDefs } from "@/types/def.types";
import type { ElementBase } from "@/types/field.types";
import type { Primitive } from "@/types/gen.types";

type GenerateLanguageNameTypeParams<T extends Primitive, TName extends string, TBase extends ElementBase> = {
	languageNames: T[] | readonly T[];
	typeName: TName;
	baseType: TBase;
	config: Config;
};

type GenerateLanguageNameTypeType = <T extends Primitive, TName extends string, TBase extends ElementBase>(
	params: GenerateLanguageNameTypeParams<T, TName, TBase>,
) => GeneratedDefs<T, TName, TBase>;

const generateLanguageNameType: GenerateLanguageNameTypeType = ({ languageNames, typeName, config, baseType }) => {
	//

	const sortedNames = sortMixed(languageNames);

	const shouldSplit = shouldSplitTypes(config, sortedNames);

	if (!shouldSplit) {
		//

		const literals = sortedNames.map((name) => {
			const template = `${name}` as const;

			const escapedQuotes = replacer(template, '"' as const, '\\"' as const);
			const escapedQuotesAndNewlines = replacer(escapedQuotes, "\n" as const, "\\n" as const);

			return `"${escapedQuotesAndNewlines}"` as const;
		});

		const joinedLits = join(literals, " | " as const);

		const typeDef = createElementType({ combined: joinedLits, base: baseType, config });

		return {
			typeDef,
			segmentDefs: [],
		};
	}

	const chunks = chunkArray(sortedNames, config.type.itemsPerSegment);

	const segmentDefs = createSegmentDefs({ chunks, typeName });
	const segmentRefs = createSegmentRefs({ chunks, typeName });

	const combinedType = join(segmentRefs, " | " as const);

	const typeDef = createElementType({ combined: combinedType, base: baseType, config });

	// const typeDef = getArrayTypeString({ elementType, readonly: config.useReadonlyArrays });

	return {
		typeDef,
		segmentDefs,
	};
};

export { generateLanguageNameType };
export type { GenerateLanguageNameTypeParams, GenerateLanguageNameTypeType };
