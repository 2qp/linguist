// type FlattenModuleExportsParams = {};

// type FlattenModuleExportsType = (params: FlattenModuleExportsParams) => void;

const flattenModuleExports = <T extends Record<string, unknown>>(modules: T[]): Array<T[keyof T]> => {
	//

	const allExports: Array<T[keyof T]> = [];

	for (let i = 0; i < modules.length; i++) {
		const mod = modules[i];
		if (!mod) continue;

		const keys = Object.keys(mod) as Array<keyof T>;

		for (let j = 0; j < keys.length; j++) {
			const key = keys[j];
			if (!key) continue;

			allExports.push(mod[key]);
		}
	}

	return allExports;
};

export { flattenModuleExports };
