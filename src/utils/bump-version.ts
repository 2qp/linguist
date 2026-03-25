const bumpVersion = (version: string, level: "patch" | "minor" | "major" = "patch"): string => {
	//

	const parts = version.split(".").map(Number);

	if (parts.length !== 3 || parts.some(Number.isNaN)) {
		throw new Error("invalid version format. must b 'x.y.z'");
	}

	const [major = 0, minor = 0, patch = 0] = parts;

	//
	switch (level) {
		case "patch":
			return `${major}.${minor}.${patch + 1}`;
		case "minor":
			return `${major}.${minor + 1}.0`;
		case "major":
			return `${major + 1}.0.0`;
	}
};

export { bumpVersion };
