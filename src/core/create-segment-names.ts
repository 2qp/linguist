import { normalizeName } from "@/transform/utils/normalize-name";

import type { NameId } from "@/types/gen.types";

type CreateSegmentNamesParams<TChunks extends unknown[][], TName extends string> = {
	typeName: TName;
	chunks: TChunks;
};

type CreateSegmentNames = <const TChunks extends unknown[][], const TName extends string>(
	params: CreateSegmentNamesParams<TChunks, TName>,
) => ReadonlyArray<NameId<TName>>;

const createSegmentNames: CreateSegmentNames = ({ chunks, typeName }) => {
	//

	const { constant } = normalizeName(typeName);

	const segmentNames = chunks.map((_, index) => {
		const segmentName = `${constant}_${index + 1}` as const;

		return segmentName;
	});

	return segmentNames;
};

export { createSegmentNames };
export type { CreateSegmentNames, CreateSegmentNamesParams };
