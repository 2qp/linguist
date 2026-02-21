import { generateSegmentedArrayType } from "./generate-segmented-array-type";
import { createElementType } from "@core/create-element-type";
import { getArrayTypeString } from "@core/get-array-type-string";
import { join } from "@utils/join";
import { replacer } from "@utils/replacer";
import { shouldSplitTypes } from "@utils/should-split-types";
import { sortMixed } from "@utils/sort";

import type { DefsGenerator } from "./types";

type GenerateArrayType = DefsGenerator<"no_base">;

const generateArrayType: GenerateArrayType = ({ stats, config, typeName }) => {
	//

	if (stats.shouldBeLiteralArray && stats.itemType && stats.itemType !== "mixed") {
		//

		const shouldSplit = shouldSplitTypes(config, [...stats.uniqueValues]);

		if (shouldSplit && typeName) {
			//

			return generateSegmentedArrayType({ stats, baseType: stats.itemType, config, typeName });
		}

		const sortedValues = sortMixed([...stats.uniqueValues]);

		const literals = sortedValues.map((values) => {
			const template = `${values}` as const;

			const escapedQuotes = replacer(template, '"' as const, '\\"' as const);
			const escapedQuotesAndNewlines = replacer(escapedQuotes, "\n" as const, "\\n" as const);

			return `"${escapedQuotesAndNewlines}"` as const;
		});

		const joinedLits = join(literals, " | " as const);

		const elementType = createElementType({
			combined: joinedLits,
			base: stats.itemType,
			config,
		});

		const typeDef = getArrayTypeString({ elementType, readonly: config.type.useReadonlyArrays });

		return {
			typeDef,
			segmentDefs: [],
			type: stats.type,
		};
	}

	// non-literal
	if (stats.isString) {
		const elementType = createElementType({ base: "string", combined: "string", config });
		const typeDef = getArrayTypeString({ elementType, readonly: config.type.useReadonlyArrays });

		return {
			typeDef,
			segmentDefs: [],
			type: stats.type,
		};
	}

	if (stats.isNumber) {
		const elementType = createElementType({ base: "number", combined: "number", config });
		const typeDef = getArrayTypeString({ elementType, readonly: config.type.useReadonlyArrays });

		return {
			typeDef,
			segmentDefs: [],
			type: stats.type,
		};
	}

	if (stats.isBoolean) {
		const elementType = createElementType({ base: "boolean", combined: "boolean", config });
		const typeDef = getArrayTypeString({ elementType, readonly: config.type.useReadonlyArrays });

		return {
			typeDef,
			segmentDefs: [],
			type: stats.type,
		};
	}

	const elementType = "any" as const;

	const typeDef = getArrayTypeString({ elementType, readonly: config.type.useReadonlyArrays });

	return {
		typeDef,
		segmentDefs: [],
		type: stats.type,
	};
};

export { generateArrayType };
export type { GenerateArrayType };
