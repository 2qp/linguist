// type RemoveTrailingSlashParams = {};

type RemoveTrailingSlashType = (path: string) => string;

const removeTrailingSlash: RemoveTrailingSlashType = (path) => {
	return path.replace(/[\\/]+$/, "");
};

export { removeTrailingSlash };
