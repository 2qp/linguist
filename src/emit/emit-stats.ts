import { getMappedFieldOrType } from "@gen/utils/get-mapped-field-or-type";

import type { Config } from "@/types/config.types";
import type { GeneratedDefs } from "@/types/def.types";
import type { FieldAnalysisMap } from "@/types/field.types";

type EmitStatsParams = {
	map: FieldAnalysisMap;
	types: Map<string, GeneratedDefs<string, string>>;
	config: Config;
	totals: { total: number; size: number };
	langs: string[];
};

type EmitStatsType = (params: EmitStatsParams) => void;

const emitStats: EmitStatsType = ({ map, types, config, totals, langs }) => {
	//

	const stats = [...map]
		.map(([field, stats]) => {
			//
			const usagePercent = ((stats.languagesUsing / totals.total) * 100).toFixed(1);
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

			const output_field = `// ${field}: used in ${stats.languagesUsing}/${totals.total} (${usagePercent}%)`;

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
		config.type.splitLargeTypes && totals.total >= config.type.minItemsForSplit
			? `// Language names split into ${Math.ceil(totals.total / config.type.itemsPerSegment)} segments (${config.type.itemsPerSegment} per segment)\n`
			: "";

	const output_sample_names = `// Sample names: ${langs
		.slice(0, 5)
		.map((n) => `"${n}"`)
		.join(", ")}${langs.length > 5 ? "..." : ""}\n\n`;

	return [
		`// Field Statistics:\n`,
		stats,
		"\n",

		//
		`// Language Name Statistics:\n`,
		`// Total languages: ${totals.total}\n`,
		output_lang_split_into,
		output_sample_names,
	].join("");
};

export { emitStats };
