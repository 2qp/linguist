import { generateArrayType } from "./generate-array-type";
import { generateLiteralType } from "./generate-literal-type";

import type { DefsGenerator } from "./types";

type GenerateFieldType = DefsGenerator<"no_base">;

const generateFieldType: GenerateFieldType = ({ stats, typeName, config }) => {
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

				if (bool) return { typeDef: `true`, segmentDefs: [], type: stats.type };

				return { typeDef: `false`, segmentDefs: [], type: stats.type };
			}

			return {
				typeDef: "boolean",
				segmentDefs: [],
				type: stats.type,
			};
		}

		return {
			typeDef: "boolean",
			segmentDefs: [],
			type: stats.type,
		};
	}

	//
	if (stats.isNumber) {
		if (stats.shouldBeLiteral) {
			return generateLiteralType({ stats, baseType: "number", config, typeName });
		}
		return {
			typeDef: "number",
			segmentDefs: [],
			type: stats.type,
		};
	}

	//
	if (stats.isString) {
		if (stats.shouldBeLiteral) {
			return generateLiteralType({ stats, baseType: "string", config, typeName });
		}

		const typeDef = config.type.allowFlexibleTypes ? ("string | (string & {})" as const) : ("string" as const);

		return {
			typeDef,
			segmentDefs: [],
			type: stats.type,
		};
	}

	const elementType = "unknown" as const;

	// mixed or object
	// mmm will handle later / recursive
	return {
		typeDef: elementType,
		segmentDefs: [],
		type: stats.type,
	};
};

export { generateFieldType };
export type { GenerateFieldType };
