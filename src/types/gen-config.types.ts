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
	out: Out;
	options: Options;
	naming: NamingConfig;
};

type InternalFile = { name: string; ext: string };

type InternalDir = { rel: string; alias: string };

type InteralOutDef = { file: InternalFile; dir: InternalDir };

type Out = {
	common: InteralOutDef;
	usage: InteralOutDef;
};

type Options = {};

type SecondaryOptions = {
	enabled: boolean;
} & Pick<TypeGeneratorConfig, "allowFlexibleTypes" | "useReadonlyArrays">;

type FieldType = {
	readonly field: string;
	readonly type: string;
};

type NamingConfig = {
	language: string;
	languageName: string;
	secondaryPrefix: string;
	secondarySuffix: string;
	fields: FieldType[];
};

type TypeGenConfigFile = {
	type: TypeGeneratorConfig;
};

export type { FieldType, InteralOutDef, TypeGeneratorConfig as TypeGenConfig, TypeGenConfigFile };
