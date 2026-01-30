type FieldTypeMapping = {
	readonly field: string;
	readonly type: string;
};

type GetMappedFieldOrTypeParams = {
	value: string;
	from: keyof FieldTypeMapping;
	to: keyof FieldTypeMapping;
	remapper: readonly FieldTypeMapping[];
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
export type { FieldTypeMapping, GetMappedFieldOrTypeParams, GetMappedFieldOrTypeType };
