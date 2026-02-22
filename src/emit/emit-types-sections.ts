import type { Primitive } from "@/types/gen.types";
import type { OutputMap } from "@/types/output.types";

const emitTypesSection = <TUnique extends Primitive>(types: OutputMap<TUnique>, languageName: string): string =>
	[...types.keys()]
		.filter((tN) => tN !== languageName)
		.map((uid) => `export type ${types.get(uid)?.type} = ${types.get(uid)?.typeDef};\n`)
		.sort()
		.join("");

export { emitTypesSection };
