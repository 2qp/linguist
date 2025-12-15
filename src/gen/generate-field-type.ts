import { generateArrayType } from "./generate-array-type";
import { generateLiteralType } from "./generate-literal-type";

import type { Config } from "@/types/config.types";
import type { GeneratedDefs } from "@/types/def.types";
import type { ElementBase, FieldAnalysis } from "@/types/field.types";
import type { Primitive } from "@/types/gen.types";

type GenerateFieldTypeParams<TName extends string, _TBase extends ElementBase, TUnique extends Primitive> = {
	field: string;
	stats: FieldAnalysis<TUnique>;
	typeName?: TName | undefined;
	config: Config;
};

type GenerateFieldTypeType = <TName extends string, TBase extends ElementBase, TUnique extends Primitive>(
	params: GenerateFieldTypeParams<TName, TBase, TUnique>,
) => GeneratedDefs<TUnique, TName, ElementBase>;

const generateFieldType: GenerateFieldTypeType = ({ stats, typeName = undefined, config }) => {
	//

	if (stats.isArray) {
		return generateArrayType({ stats, config, typeName });
	}

	//
	if (stats.isBoolean) {
		if (stats.shouldBeLiteral) {
			//

			const values = Array.from(stats.uniqueValues);
			if (values.length === 1 && values[0] !== undefined) {
				const bool = values[0];

				if (bool) return { typeDef: `true`, segmentDefs: [] };

				return { typeDef: `false`, segmentDefs: [] };
			}

			return {
				typeDef: "boolean",
				segmentDefs: [],
			};
		}

		return {
			typeDef: "boolean",
			segmentDefs: [],
		};
	}

	//
	if (stats.isNumber) {
		if (stats.shouldBeLiteral) {
			return generateLiteralType({ values: stats.uniqueValues, baseType: "number", config, typeName });
		}
		return {
			typeDef: "number",
			segmentDefs: [],
		};
	}

	//
	if (stats.isString) {
		if (stats.shouldBeLiteral) {
			return generateLiteralType({ values: stats.uniqueValues, baseType: "string", config, typeName });
		}

		const typeDef = config.type.allowFlexibleTypes ? ("string | (string & {})" as const) : ("string" as const);

		return {
			typeDef,
			segmentDefs: [],
		};
	}

	const elementType = "any" as const;

	// mixed or object
	// mmm will handle later / recursive
	return {
		typeDef: elementType,
		segmentDefs: [],
	};
};

export { generateFieldType };
export type { GenerateFieldTypeParams, GenerateFieldTypeType };
