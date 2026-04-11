import { createUsage } from "./create-usage";
import { analyzeFields } from "@core/analyze-fields";
import { createMeta } from "@core/create-meta";
import { createReference } from "@core/create-reference";
import { processFields } from "@gen/utils/process-fields";
import { emitSegmentSection } from "@/emit/emit-segment-section";
import { emitTypesSection } from "@/emit/emit-types-sections";

import type { Generator } from "@gen/types";
import type { Config } from "@/types/config.types";
import type { LanguageData } from "@/types/lang.types";

type GenerateUsageTypesParams = {
	config: Config;
	source: LanguageData;
};

type GenerateUsageTypes = Generator<string>;

const generateUsageTypes: GenerateUsageTypes = ({ config: base, source }) => {
	//

	const config = { ...base, type: { ...base.type, secondary: { ...base.type.secondary, enabled: false } } };

	// MARK: USAGE
	const usage = createUsage({ data: source, config });
	const entries = Object.fromEntries(usage.entries());

	const ref = createReference({ config, source: entries });
	const meta = createMeta({ config, source, ref });

	const stats = analyzeFields({ source: entries, config, ref: ref });

	const usageFields = processFields({
		stats,
		config,
		ref: ref,
		meta,
	});

	const output_usage_segments = emitSegmentSection(usageFields.allSegmentDefinitions);
	const output_usage_sorted_types = emitTypesSection(usageFields.generatedTypes, "Uuhh");

	return [
		`// USAGE\n`,
		//
		output_usage_segments,
		output_usage_sorted_types,
	].join("\n");
};

export { generateUsageTypes };
export type { GenerateUsageTypes, GenerateUsageTypesParams };
