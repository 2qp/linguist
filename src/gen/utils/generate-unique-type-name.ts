const generateUniqueTypeName = (baseName: string, existingNames: Set<string>, suffix: number = 1): string => {
	const candidateName = suffix === 1 ? baseName : `${baseName}${suffix}`;

	if (!existingNames.has(candidateName)) {
		return candidateName;
	}

	return generateUniqueTypeName(baseName, existingNames, suffix + 1);
};

export { generateUniqueTypeName };
