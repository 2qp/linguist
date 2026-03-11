import { join } from "@utils/join";
import { stringify } from "safe-stable-stringify";
import { normalizeName } from "@/transform/utils/normalize-name";

import type { Primitive } from "@/types/gen.types";
import type { SegmentDef, SegmentDefRecord } from "@/types/segment.types";

type CreateSegmentDefsParams<TChunks extends unknown[][], TName extends string> = {
	typeName: TName;
	chunks: TChunks;
};

type PrimitiveReturn<T extends Primitive[][], TName extends string> = SegmentDef<T, TName>[] & {};

type RecordReturn<T extends Record<string, unknown>[][], TName extends string> = SegmentDefRecord<
	T,
	TName,
	{ partial: true }
>[] & {};

type CreateSegmentDefsOverloaded = {
	//

	<const TChunks extends Primitive[][], const TName extends string>(
		params: CreateSegmentDefsParams<TChunks, TName>,
	): PrimitiveReturn<TChunks, TName>;

	<const TChunks extends Record<string, unknown>[][], const TName extends string>(
		params: CreateSegmentDefsParams<TChunks, TName>,
	): RecordReturn<TChunks, TName>;

	//
};

const createSegmentDefs: CreateSegmentDefsOverloaded = (<const T extends unknown[][], const TName extends string>({
	chunks,
	typeName,
}: CreateSegmentDefsParams<T, TName>) => {
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
}) as CreateSegmentDefsOverloaded;

export { createSegmentDefs };
export type { CreateSegmentDefsParams };
