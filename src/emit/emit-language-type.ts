import type { UID } from "@/types/branded.types";
import type { Emitter } from "./types";

type EmitLanguageType = Emitter;

const emitLanguageType: EmitLanguageType = ({ config, fields }) => {
	const fields_out = fields.stats.flatMap(([field, stats]) => {
		//

		const typeNames = [...fields.generatedTypes].map(([segUid, def]) => {
			//

			const uid = stats.uid;

			if (uid !== segUid) return undefined;

			return [uid, def.type];
		});

		const result = typeNames
			.filter((i): i is [UID, string] => i !== undefined && i[0] !== undefined && i[1] !== undefined)
			.map(([_uid, name]) => {
				//

				const typeDef = name;

				const optional = stats.isOptional ? "?" : "";

				return `	${field}${optional}: ${typeDef};\n`;
			});

		return result;
	});

	// console.log(stats, "STATS");
	// console.log(types, "TYPES ");

	if (config.type.secondary.enabled) {
		//

		const name = `${config.type.naming.secondaryPrefix}${config.type.naming.language}`;

		const start = `\nexport type ${name} = {\n`;
		const end = `}\n\n` as const;

		return [start, ...fields_out, end];
	}

	const name = config.type.naming.language;

	const start = `\nexport type ${name} = {\n`;
	const end = `}\n\n` as const;

	return [start, ...fields_out, end];
};

export { emitLanguageType };

// MARK: NOTES

// if needed inline typedef rather than referencing exported type
// export type Language = {  ace_mode: (typeof ACE_MODE_1[number] |
//

//
// const res = getMappedFieldOrType({
// 	value: field,
// 	from: "field",
// 	to: "type",
// 	remapper: config.type.naming.fields,
// });
// const segmentBaseTypeName = res.resolved ? res.value : normalizeName(field).constant;
// const typeName = generateUniqueTypeName(segmentBaseTypeName, new Set());
