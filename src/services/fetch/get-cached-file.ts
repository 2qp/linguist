import { getFile } from "./get-file";
import { createHash } from "node:crypto";
import { mkdir, readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { writeFile } from "@services/fs/write-file";
import { log } from "@utils/log";
import { stringify } from "safe-stable-stringify";

const CACHE_DIR = resolve(".cache");

const TTL = 1000 * 60 * 60 * 24 * 7;

type Parser = "json" | "text" | "blob" | "arrayBuffer";

type CacheType = "hit" | "miss" | "stale" | "fetch";

const hash = (input: string) => createHash("sha1").update(input).digest("hex");

const getCachePath = (url: string, parser: Parser) => join(CACHE_DIR, `${hash(url)}.${parser}`);

const _log = (type: CacheType, url: string) => log.info(`[cache:${type}] ${url}`);

const getCachedFile = async <T>(url: string, parser: Parser): Promise<T> => {
	//

	const cachePath = getCachePath(url, parser);

	try {
		const stats = await stat(cachePath);
		const isFresh = Date.now() - stats.mtimeMs < TTL;

		if (isFresh) {
			_log("hit", url);

			const file = await readFile(cachePath);

			const getCachedData = async () => {
				switch (parser) {
					case "json":
						return (await JSON.parse(file.toString("utf-8"))) as T;
					case "text":
						return file.toString("utf-8") as T;
					case "blob":
						return new Blob([file]) as T;
					case "arrayBuffer":
						return file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as T;
					default:
						throw new Error(`Unsupported parser type: ${parser}`);
				}
			};

			return await getCachedData();
		}

		_log("stale", url);
	} catch {
		_log("miss", url);
	}

	_log("fetch", url);

	const data = (await getFile(url, parser)) as T;

	const createFile = async () => {
		switch (parser) {
			case "json":
				await writeFile({ filePath: cachePath, content: stringify(data) || "" });
				break;

			case "text":
				await writeFile({ filePath: cachePath, content: data as string, options: { encoding: "utf-8" } });
				break;

			case "arrayBuffer":
				await writeFile({ filePath: cachePath, content: Buffer.from(data as ArrayBufferLike) });
				break;

			case "blob": {
				const buffer = Buffer.from(await (data as Blob).arrayBuffer());
				await writeFile({ filePath: cachePath, content: buffer });
				break;
			}
		}
	};

	await mkdir(CACHE_DIR, { recursive: true });
	await createFile();

	return data;
};

export { getCachedFile };
