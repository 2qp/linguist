import { createFieldSet } from "@gen/utils/create-field-set";
import { createFieldValues } from "@/transform/utils/create-field-values";

import type { Field } from "@/types/branded.types";
import type { Config } from "@/types/config.types";
import type { LanguageData } from "@/types/lang.types";

const getFieldsWithValueArrays = ({ source, config }: { source: LanguageData; config: Config }) => {
	//

	const fields = createFieldSet({ config, source });

	const map = new Map<Field, unknown[]>();

	for (const field of fields) {
		const ar = createFieldValues({ config, source, field: field });
		map.set(field, ar);
	}

	return map;
};

export { getFieldsWithValueArrays };
