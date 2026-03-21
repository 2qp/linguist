import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { BASE_DIR, ROOT_DIR } from "@/constants/paths";

const resolvePath = (...segments: string[]): string => {
	return resolve(ROOT_DIR, ...segments);
};

const resolvePathURL = (...segments: string[]): URL => {
	return pathToFileURL(resolvePath(...segments));
};

//
const resolveSrcPath = (...segments: string[]): string => {
	return resolve(BASE_DIR, ...segments);
};

const resolveSrcPathURL = (...segments: string[]): URL => {
	return pathToFileURL(resolveSrcPath(...segments));
};

export { resolvePath, resolvePathURL, resolveSrcPath, resolveSrcPathURL };
