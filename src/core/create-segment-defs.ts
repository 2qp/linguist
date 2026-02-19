import { join } from "@utils/join";
import stringify from "safe-stable-stringify";
import { normalizeName } from "@/transform/utils/normalize-name";

import type { Primitive } from "@/types/gen.types";
import type { WithPhase } from "@/types/phantom.types";
import type { SegmentChunkedDef, SegmentDef } from "@/types/segment.types";

type CreateSegmentDefsParams<TChunks extends Primitive[][], TName extends string> = {
	typeName: TName;
	chunks: TChunks;
};

// type CreateSegmentDefsType = <const T extends Primitive[][], const TName extends string>(
// 	params: CreateSegmentDefsParams<T, TName>,
// ) => SegmentDef<T, TName>[];

type CreateSegmentDefsOverloaded = {
	//

	<const TChunks extends Primitive[][], const TName extends string>(
		params: CreateSegmentDefsParams<TChunks, TName> & WithPhase<"transform">,
	): SegmentChunkedDef<TChunks, TName>[];

	<const TChunks extends Primitive[][], const TName extends string>(
		params: CreateSegmentDefsParams<TChunks, TName> & Partial<WithPhase<"generate">>,
	): SegmentDef<TChunks, TName>[];

	//
};
/**
 * usually 50 per chunk
 */
const createSegmentDefs: CreateSegmentDefsOverloaded = ({ chunks, typeName }) => {
	//

	const { constant } = normalizeName(typeName);

	const segmentDefs = chunks.map((chunk, index) => {
		const segmentName = `${constant}_${index + 1}` as const;

		const stringified = chunk.map((value) => `${stringify(value)}` as const);

		const constArray = join(stringified, ", " as const);

		const template = `const ${segmentName} = [${constArray}] as const;` as const;

		return template;
	});

	return segmentDefs;
};

export { createSegmentDefs };
export type { CreateSegmentDefsParams };
