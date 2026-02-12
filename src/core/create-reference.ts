import { randomUUID } from "node:crypto";
import { createFieldSet } from "@gen/utils/create-field-set";

import type { Field, UID } from "@/types/branded.types";
import type { Config } from "@/types/config.types";
import type { LanguageData } from "@/types/lang.types";

type CreateReferenceParams = {
	source: LanguageData;
	config: Config;
};

type Ref = {
	uidToField: Map<UID, Field>;
	fieldToUid: Map<Field, UID>;
};

type CreateReference = (params: CreateReferenceParams) => Ref;

const createReference: CreateReference = ({ source, config }) => {
	//

	const fields = createFieldSet({ source, config });

	const uidToField = new Map<UID, Field>();
	const fieldToUid = new Map<Field, UID>();

	for (const name of fields) {
		const uid = randomUUID() as UID;

		const existingField = uidToField.get(uid);
		if (existingField) {
			throw new Error(`key collision detected: "${uid} : ${existingField}"`);
		}

		const existingUid = fieldToUid.get(name as Field);
		if (existingUid) {
			throw new Error(`key collision detected: "${name} : ${existingUid}"`);
		}

		fieldToUid.set(name as Field, uid);
		uidToField.set(uid, name as Field);
	}

	return { uidToField, fieldToUid };
};

export { createReference };
export type { CreateReference, CreateReferenceParams, Ref };
