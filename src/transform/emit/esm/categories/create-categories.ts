import { emitCategoryFile } from "./emit-category-file";
import { join } from "node:path";
import { ensureDir } from "@utils/ensure-dir";
import { writeFile } from "@utils/write-file";

import type { Config } from "@/types/config.types";
import type { Languages, Type } from "@/types/generated.types";

type CreateCategoriesParams = { grouped: Record<Type, Partial<Languages>>; config: Config };

type CreateCategoriesType = (params: CreateCategoriesParams) => Promise<void>;

const createCategories: CreateCategoriesType = async ({ config, grouped }) => {
	//

	const catDir = join(config.data.paths.outputDir, "categories");
	await ensureDir(catDir);

	await Promise.all(
		Object.entries(grouped).map(async ([category, data]) => {
			const filePath = join(catDir, `${category}.ts`);
			const content = emitCategoryFile({ config, languages: data, category });
			await writeFile({ filePath, content });
		}),
	);
};

export { createCategories };
export type { CreateCategoriesParams, CreateCategoriesType };
