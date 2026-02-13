import { normalizeName } from "@/transform/utils/normalize-name";

import type { Primitive, TNameId } from "@/types/gen.types";

type CreateSegmentNamesParams<T extends Primitive, TName extends string> = {
	typeName: TName;
	chunks: ReadonlyArray<ReadonlyArray<T>>;
};

type CreateSegmentNames = <T extends Primitive, TName extends string>(
	params: CreateSegmentNamesParams<T, TName>,
) => ReadonlyArray<TNameId<TName>>;

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
export type { CreateSegmentNamesParams, CreateSegmentNames };
