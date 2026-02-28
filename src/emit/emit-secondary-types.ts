import { emitLanguageType } from "./emit-language-type";
import { emitTypesSection } from "./emit-types-sections";
import { createSecondaryName } from "@gen/utils/misc/create-secondary-name";
import { processFields } from "@gen/utils/process-fields";

import type { Config } from "@/types/config.types";
import type { Emitter } from "./types";

type EmitSecondaryTypesType = Emitter;

const emitSecondaryTypes: EmitSecondaryTypesType = ({ config: rawConfig, ...params }) => {
	//

	if (!rawConfig.type.secondary.enabled) return [];

	const config: Config = { ...rawConfig, type: { ...rawConfig.type, ...rawConfig.type.secondary } };

	const fields = processFields({
		...params,
		config,
		_role: "secondary",
	});

	const name = createSecondaryName({ name: config.type.naming.languageName, config });

	const output_strict_sorted_types = emitTypesSection(fields.generatedTypes, name);

	const output_strict_language_type = emitLanguageType({
		...params,
		fields,
		config,
		_role: "secondary",
	});

	const strict = [output_strict_sorted_types, ...output_strict_language_type];

	return strict;
};

export { emitSecondaryTypes };
