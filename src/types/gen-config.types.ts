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
	secondary: SecondaryOptions;

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

type SecondaryOptions = {
	enabled: boolean;
} & Pick<TypeGeneratorConfig, "allowFlexibleTypes" | "useReadonlyArrays">;

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
	secondaryPrefix: string;
	fields: FieldType[];
};

type TypeGenConfigFile = {
	type: TypeGeneratorConfig;
};

export type { FieldType, TypeGeneratorConfig as TypeGenConfig, TypeGenConfigFile };
