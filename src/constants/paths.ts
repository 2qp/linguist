import { resolve } from "node:path";

const BASE_DIR = resolve(import.meta.dirname, "../");

const ROOT_DIR = resolve(import.meta.dirname, "../../");

export { BASE_DIR, ROOT_DIR };
