import { normalizeName } from "@/transform/utils/normalize-name";

import type { IdType, Primitive } from "@/types/gen.types";

type CreateSegmentRefsParams<T extends Primitive, TName extends string> = {
	typeName: TName;
	chunks: ReadonlyArray<ReadonlyArray<T>>;
};

type CreateSegmentRefsType = <T extends Primitive, TName extends string>(
	params: CreateSegmentRefsParams<T, TName>,
) => ReadonlyArray<IdType<TName>>;

const createSegmentRefs: CreateSegmentRefsType = ({ chunks, typeName }) => {
	//

	const { constant } = normalizeName(typeName);

	const segmentRefs = chunks.map((_, index) => {
		const segmentName = `${constant}_${index + 1}` as const;
		return `typeof ${segmentName}[number]` as const;
	});

	return segmentRefs;
};

export { createSegmentRefs };
export type { CreateSegmentRefsParams, CreateSegmentRefsType };
