import { getMappedFieldOrType } from "@gen/utils/get-mapped-field-or-type";

import type { Meta } from "@core/create-meta";
import type { UID } from "@/types/branded.types";
import type { Config } from "@/types/config.types";
import type { GeneratedDefs } from "@/types/def.types";
import type { FieldAnalysisArray } from "@/types/field.types";
import type { Primitive } from "@/types/gen.types";

type EmitStatsParams = {
	stats: FieldAnalysisArray;
	types: Map<UID, GeneratedDefs<Primitive, string>>;
	config: Config;
	meta: Meta;
};

type EmitStatsType = (params: EmitStatsParams) => string;

const emitStats: EmitStatsType = ({ stats, types, config, meta }) => {
	//

	stats
		.map(([field, stats]) => {
			//
			const usagePercent = ((stats.languagesUsing / meta.languageCount) * 100).toFixed(1);
			const namedType = [...types.keys()].find((tName) => {
				//

				const remappedField = getMappedFieldOrType({
					value: field,
					from: "field",
					to: "type",
					remapper: config.type.naming.fields,
				});

				return tName.toLowerCase() === remappedField.value.toLowerCase().replace(/_/g, "");
			});

			const output_field = `// ${field}: used in ${stats.languagesUsing}/${meta.languageCount} (${usagePercent}%)`;

			const output_named_type = ` -> ${namedType}`;
			const output_split_into =
				config.type.splitLargeTypes && stats.uniqueValues.size >= config.type.minItemsForSplit
					? ` [SPLIT into ${Math.ceil(stats.uniqueValues.size / config.type.itemsPerSegment)} segments]`
					: "";

			const output_array = stats.isArray ? `, array[${stats.uniqueValues.size}]` : "";
			const output_literal = !stats.isArray && stats.shouldBeLiteral ? `, ${stats.uniqueValues.size} values` : "";
			const output_stats_end = `\n`;

			const out = [
				output_field,
				output_named_type,
				output_split_into,
				output_array,
				output_literal,
				output_stats_end,
			].join("");

			return out;
		})
		.join("");

	const output_lang_split_into =
		config.type.splitLargeTypes && meta.languageCount >= config.type.minItemsForSplit
			? `// Language names split into ${Math.ceil(meta.languageCount / config.type.itemsPerSegment)} segments (${config.type.itemsPerSegment} per segment)\n`
			: "";

	// const output_sample_names = `// Sample names: ${langs
	// 	.slice(0, 5)
	// 	.map((n) => `"${n}"`)
	// 	.join(", ")}${langs.length > 5 ? "..." : ""}\n\n`;

	return [
		`// Field Statistics:\n`,
		stats,
		"\n",

		//
		`// Language Name Statistics:\n`,
		`// Total languages: ${meta.languageCount}\n`,
		output_lang_split_into,
	].join("");
};

export { emitStats };
