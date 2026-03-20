import type { Field } from "@/types/branded.types";
import type { Language } from "@/types/generated.types";

type GetUsageNameParams = {
	left: keyof Language | Field;
	right: keyof Language | Field;
};

type GetUsageName = (params: GetUsageNameParams) => `${(typeof params)["left"]}s_with_${(typeof params)["right"]}`;

const getUsageName: GetUsageName = ({ left, right }) => {
	return `${left}s_with_${right}`;
};

export { getUsageName };
export type { GetUsageNameParams, GetUsageName };
