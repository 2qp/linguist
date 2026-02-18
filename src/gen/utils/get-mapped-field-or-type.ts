import type { Field } from "@/types/branded.types";
import type { FieldType } from "@/types/gen-config.types";

type GetMappedFieldOrTypeParams = {
	value: string | Field;
	from: keyof FieldType;
	to: keyof FieldType;
	remapper: readonly FieldType[];
};

type GetMappedFieldOrTypeType = (params: GetMappedFieldOrTypeParams) => { value: string; resolved: boolean };

const getMappedFieldOrType: GetMappedFieldOrTypeType = ({ from, to, value, remapper }) => {
	//

	if (from === to) {
		return { value, resolved: false };
	}

	const match = remapper.find((r) => r[from] === value);
	const res = match ? { value: match[to], resolved: true } : { value, resolved: false };

	return res;
};

export { getMappedFieldOrType };
export type { GetMappedFieldOrTypeParams, GetMappedFieldOrTypeType };
