import { readdir, readFile, stat as statAsync } from "node:fs/promises";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

import type { SuiteAPI } from "vitest";

describe("generated files", async () => {
	//

	const walkDir = async (dir: string, parentDescribe: SuiteAPI = describe) => {
		//

		const items = (await readdir(dir)).sort();

		for (const item of items) {
			const fullPath = join(dir, item);

			const stat = await statAsync(fullPath);

			if (!stat.isDirectory() && !item.endsWith(".ts")) continue;

			if (stat.isDirectory()) {
				parentDescribe(item, async () => {
					await walkDir(fullPath, describe);
				});

				continue;
			}

			//

			const testName = item.replace(".ts", "");

			parentDescribe(testName, () => {
				it("matches snapshot", async () => {
					const content = await readFile(fullPath, "utf-8");

					expect(content).toMatchSnapshot();
				});
			});
		}
	};

	await walkDir(resolve(".", "src", "generated"));
});
