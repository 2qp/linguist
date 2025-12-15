type TypeGeneratorConfig = {
	maxLiteralValues: number;
	maxArrayLiteralItems: number;
	splitLargeTypes: boolean;
	itemsPerSegment: number;
	minItemsForSplit: number;
	minLanguagesForNamedType: number;
	minUsagePercent: number;
	showFieldStats: boolean;
	showExamples: number;
	allowFlexibleTypes: boolean;
	useReadonlyArrays: boolean;
};

type TypeGenConfigFile = {
	type: TypeGeneratorConfig;
};

export type { TypeGeneratorConfig as TypeGenConfig, TypeGenConfigFile };
