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

	//
	paths: Paths;
	aliases: Paths;
	out: Out;
	options: Options;
};

type Out = {
	fileName: string;
	fileNameNoExt: string;
};

type Options = {};

type Paths = {
	outputDir: string;
};

type TypeGenConfigFile = {
	type: TypeGeneratorConfig;
};

export type { TypeGeneratorConfig as TypeGenConfig, TypeGenConfigFile };
