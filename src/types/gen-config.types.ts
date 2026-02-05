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
	strict: boolean;
	useReadonlyArrays: boolean;

	//
	paths: Paths;
	aliases: Paths;
	out: Out;
	options: Options;
	naming: NamingConfig;
};

type Out = {
	fileName: string;
	fileNameNoExt: string;
};

type Options = {};

type Paths = {
	outputDir: string;
};

type FieldType = {
	readonly field: string;
	readonly type: string;
};

type NamingConfig = {
	language: string;
	languageName: string;
	strictPrefix: string;
	fields: FieldType[];
};

type TypeGenConfigFile = {
	type: TypeGeneratorConfig;
};

export type { FieldType, TypeGeneratorConfig as TypeGenConfig, TypeGenConfigFile };
