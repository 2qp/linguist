import { ANSI_COLORS } from "@/constants/ansi-colors";

type Join<K, P> = K extends string | number
	? P extends string | number
		? `${K}${"" extends P ? "" : "."}${P}`
		: never
	: never;

type Leaves<T> = T extends object ? { [K in keyof T]-?: Join<K, Leaves<T[K]>> }[keyof T] : "";

type ColorPath = Leaves<typeof ANSI_COLORS>;

const getNestedValue = (obj: Record<string, unknown>, path: string): string => {
	//

	const [first, ...rest] = path.split(".");
	if (first === undefined) return "";

	const value = obj[first];

	if (rest.length === 0) return (value as string) ?? "";

	return getNestedValue(value as Record<string, unknown>, rest.join("."));
};

const clr = (path: ColorPath, text: string) =>
	`${getNestedValue(ANSI_COLORS, path)}${text}${ANSI_COLORS.reset}` as const;

export { clr };
