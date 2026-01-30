import { LANGUAGE_NAME } from "./identifiers";

import type { FieldTypeMapping } from "@gen/utils/get-mapped-field-or-type";

const FIELD_TYPE_MAPPING = [{ field: "name", type: LANGUAGE_NAME }] as const satisfies FieldTypeMapping[];

export { FIELD_TYPE_MAPPING };
