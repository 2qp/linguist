import type { UID } from "@/types/branded.types";
import type { GeneratedDefs } from "@/types/def.types";

const emitTypesSection = (types: Map<UID, GeneratedDefs<string, string>>, languageName: string): string =>
	[...types.keys()]
		.sort()
		.filter((tN) => tN !== languageName)
		.map((uid) => `export type ${types.get(uid)?.type} = ${types.get(uid)?.typeDef};\n`)
		.join("");

export { emitTypesSection };
