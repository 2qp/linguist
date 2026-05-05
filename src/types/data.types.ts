type Paths = {
	outputDir: string;
	jsonDir: string;
	mapsDir: string;
	typesDir: string;
	flatDir: string;
	manifestsDir: string;
	arraysDir: string;

	gettersDir: string;
	getters_dynamic_dir: string; // :3 y not
	predicatesDir: string;
};

type SourcePaths = {
	gettersDir: string;
	predicatesDir: string;
};

type DataConfig = {
	paths: Paths;
	sourcePaths: SourcePaths;
};

type DataConfigFile = {
	data: DataConfig;
};

export type { DataConfig, DataConfigFile };
