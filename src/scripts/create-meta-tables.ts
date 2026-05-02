import { analyzeFields } from "@core/analyze-fields";
import { createMeta } from "@core/create-meta";
import { createReference } from "@core/create-reference";
import { getUsageName } from "@gen/usage/get-usage-name";
import { createFieldSet } from "@gen/utils/create-field-set";
import { processFields } from "@gen/utils/process-fields";
import { getFile } from "@services/fetch/get-file";
import { writeFile } from "@services/fs/write-file";
import { buildEntries } from "@utils/build-entries";
import { getPreviewOfObj, parseObject } from "@utils/get-preview-of-obj";
import { configLoader } from "@/infra/loaders/config-loader";
import { yamlLoader } from "@/infra/loaders/yaml-loader";
import { generateIndexEmitterOptions } from "@/transform/emit/esm/indexes/generate-index-emitter-options";
import { generateMapOptions } from "@/transform/emit/maps/generate-map-options";
import { normalizeName } from "@/transform/utils/normalize-name";
import { getWrapped } from "@/transform/utils/statement/statement-builder-utils";

import type { Languages } from "@/types/generated.types";
import type { LanguageData } from "@/types/lang.types";

type CreateMetaTablesParams = {};

type CreateMetaTables = (params: CreateMetaTablesParams) => Promise<void>;

const createMetaTables: CreateMetaTables = async () => {
	//

	const config = await configLoader();

	const yamlArrBuffer = await getFile<ArrayBuffer>(config.core.url, "arrayBuffer");
	const yamlBuffer = Buffer.from(yamlArrBuffer);
	const yamlStr = yamlBuffer.toString("utf-8");

	const data = yamlLoader<LanguageData>({ str: yamlStr });
	if (!data) throw Error("Unable load yaml data");

	const source = buildEntries<LanguageData, Languages>({ source: data });

	const ref = createReference({ config, source });
	const meta = createMeta({ config, source, ref });

	const _stats = analyzeFields({ source, config, ref, _phase: "transform" });
	const fields = processFields({ config, meta, stats: _stats, ref });

	const stats = new Map(fields.stats);

	const fieldSet = createFieldSet({ source, config, _phase: "transform" });

	const len = Object.keys(source).length;

	const uniqueFields = [...fieldSet].filter((item) => stats.get(item)?.uniqueValues.size === len);

	const UNIQUE_FIELDS = new Set(uniqueFields);

	const mapEmitters = [...generateMapOptions([...fieldSet], UNIQUE_FIELDS)];
	const indexEmitters = [...generateIndexEmitterOptions([...fieldSet], UNIQUE_FIELDS)];

	const header = `| File                      | Variable               | Type                                     | Description           | Example                                                                 |
| :------------------------ | :--------------------- | :--------------------------------------- | :-------------------- | :---------------------------------------------------------------------- |
`;

	const mapRows = await Promise.all(
		mapEmitters.map(async ({ name, emitter, options }) => {
			//

			const { norm, blocks } = emitter({ languages: source, config, stats: fields.stats, name, options });

			const sample = blocks.getBlocks().find((block) => block.kind === "expr" && block.prefixed === true);

			const obj = parseObject(sample?.code || "");

			const preview = getPreviewOfObj(obj);

			const getMeta = () => {
				switch (options.kind) {
					case "primitive": {
						const field = getUsageName({ left: options.key, right: options.value });
						const type = normalizeName(field).typeName;
						const stat = stats.get(options.key);
						const suffix = stat?.isArray ? "[number]" : "";

						return {
							record: `Record<${stat?.type}${suffix}, ${type}>`,
							pair: [options.key, options.value],
						};
					}

					case "set": {
						const field = getUsageName({ left: options.right, right: options.left });
						const type = normalizeName(field).typeName;
						const stat = stats.get(options.left);
						const suffix = stat?.isArray ? "[number]" : "";

						return {
							record: `Record<${stat?.type}${suffix}, ${type}>`,
							pair: [options.left, options.right],
						};
					}

					default:
						throw Error("unexpected switch case");
				}
			};

			const { record, pair } = getMeta();

			const row = `| \`${norm.fileName}.ts\` | \`${norm.varName}\` | \`${record}\` | ${pair[0]} to ${pair[1]} | \`${preview}\` |
`;

			return row;
		}),
	);

	const indexRows = await Promise.all(
		indexEmitters.map(async ({ name, emitter, options, type }) => {
			//

			const { norm, blocks } = emitter({ languages: source, config, stats: fields.stats, name, options });

			const sample = blocks.getBlocks().find((block) => block.kind === "expr" && block.prefixed === false);

			const obj = parseObject(sample?.code || "");
			const preview = getPreviewOfObj(obj);

			const getWrappedType = (isArray: boolean) => {
				const languageType = isArray ? "Language[]" : "Language";
				const wrapper = type === "eager" ? "$" : "() => Promise<$>";
				return getWrapped([languageType], wrapper);
			};

			const getMeta = () => {
				switch (options.kind) {
					case "primitive": {
						const stat = stats.get(options.key);
						const isArray = stat?.isArray;

						return {
							record: `Record<${stat?.type}${isArray ? "[number]" : ""}, ${getWrappedType(!!isArray)}>`,
							pair: [options.key, options.value],
						};
					}

					case "set": {
						const stat = stats.get(options.left);
						const isArray = stat?.isArray;

						return {
							record: `Record<${stat?.type}${isArray ? "[number]" : ""}, ${getWrappedType(true)}>`,
							pair: [options.left, options.right],
						};
					}

					default:
						throw Error("unexpected switch case");
				}
			};

			const { record, pair } = getMeta();

			const row = `| \`${norm.fileName}.ts\` | \`${norm.varName}\` | \`${record}\` | ${pair[0]} to ${pair[1]} | \`${preview}\` |
`;

			return row;
		}),
	);

	const mapContent = header + mapRows.join("");
	const indexContent = header + indexRows.join("");

	await Promise.all([
		writeFile({ filePath: "maps.meta.generated.md", content: mapContent }),
		writeFile({ filePath: "indexes.meta.generated.md", content: indexContent }),
	]);
};

await createMetaTables({});

export { createMetaTables };
export type { CreateMetaTables, CreateMetaTablesParams };
