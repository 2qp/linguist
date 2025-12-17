type Paths = {
	outputDir: string;
	esmDir: string;
	jsonDir: string;
	mapsDir: string;
	typesDir: string;
	flatDir: string;
	manifestsDir: string;
};

type DataConfig = {
	paths: Paths;
};

type DataConfigFile = {
	data: DataConfig;
};

export type { DataConfig, DataConfigFile };
