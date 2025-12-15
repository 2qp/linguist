import type { GeneratedDefs } from "@/types/def.types";

const emitTypesSection = (types: Map<string, GeneratedDefs<string, string>>, languageName: string): string =>
	[...types.keys()]
		.sort()
		.filter((tN) => tN !== languageName)
		.map((typeName) => `export type ${typeName} = ${types.get(typeName)?.typeDef};\n`)
		.join("");

export { emitTypesSection };
