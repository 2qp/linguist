import { generateSegmentedArrayType } from "./generate-segmented-array-type";
import { createElementType } from "@core/create-element-type";
import { getArrayTypeString } from "@core/get-array-type-string";
import { join } from "@utils/join";
import { replacer } from "@utils/replacer";
import { shouldSplitTypes } from "@utils/should-split-types";
import { sortMixed } from "@utils/sort";

import type { GeneratedDefs } from "@/types/def.types";
import type { ElementBase, FieldAnalysis } from "@/types/field.types";
import type { Primitive } from "@/types/gen";
import type { TypeGenConfig } from "@/types/gen-config.types";

type GenerateArrayTypeParams<TName extends string, _TBase extends ElementBase, TUnique extends Primitive> = {
	stats: FieldAnalysis<TUnique>;
	config: TypeGenConfig;
	// baseType: TBase;
	typeName?: TName | undefined;
};

type GenerateArrayTypeType = <TName extends string, TBase extends ElementBase, TUnique extends Primitive>(
	params: GenerateArrayTypeParams<TName, TBase, TUnique>,
) => GeneratedDefs<TUnique, TName, ElementBase>;

const generateArrayType: GenerateArrayTypeType = ({ stats, config, typeName }) => {
	//

	if (stats.shouldBeLiteralArray && stats.itemType && stats.itemType !== "mixed") {
		//

		const shouldSplit = shouldSplitTypes(config, [...stats.uniqueValues]);

		if (shouldSplit && typeName) {
			//

			return generateSegmentedArrayType({ values: stats.uniqueValues, baseType: stats.itemType, config, typeName });
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

		const typeDef = getArrayTypeString({ elementType, readonly: config.useReadonlyArrays });

		return {
			typeDef,
			segmentDefs: [],
		};
	}

	// non-literal
	if (stats.isString) {
		const elementType = createElementType({ base: "string", combined: "string", config });
		const typeDef = getArrayTypeString({ elementType, readonly: config.useReadonlyArrays });

		return {
			typeDef,
			segmentDefs: [],
		};
	}

	if (stats.isNumber) {
		const elementType = createElementType({ base: "number", combined: "number", config });
		const typeDef = getArrayTypeString({ elementType, readonly: config.useReadonlyArrays });

		return {
			typeDef,
			segmentDefs: [],
		};
	}

	if (stats.isBoolean) {
		const elementType = createElementType({ base: "boolean", combined: "boolean", config });
		const typeDef = getArrayTypeString({ elementType, readonly: config.useReadonlyArrays });

		return {
			typeDef,
			segmentDefs: [],
		};
	}

	const elementType = "any" as const;

	const typeDef = getArrayTypeString({ elementType, readonly: config.useReadonlyArrays });

	return {
		typeDef,
		segmentDefs: [],
	};
};

export { generateArrayType };
export type { GenerateArrayTypeParams, GenerateArrayTypeType };
