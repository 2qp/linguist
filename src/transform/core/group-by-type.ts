import type { Languages, Type } from "@/generated/types/language-types.generated";
import type { Entries } from "@/types/utility.types";

type GroupByTypeParams = {
	languages: Languages;
};

type GroupByTypeType = (params: GroupByTypeParams) => Record<Type, Languages>;

const groupByType: GroupByTypeType = ({ languages }) => {
	//

	const record: Record<Type, Languages> = {
		data: {},
		markup: {},
		programming: {},
		prose: {},
	};

	for (const [name, data] of Object.entries(languages) as Entries<Languages>) {
		//

		if (!data) continue;

		const type = data.type;

		record[type] ??= {};

		record[type][name] = data;
	}

	return record;
};

export { groupByType };
export type { GroupByTypeParams, GroupByTypeType };
