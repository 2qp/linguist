import { stringify } from "safe-stable-stringify";

import type { NormalizedName } from "@/transform/utils/normalize-name";
import type { Language } from "@/types/generated.types";

type EmitLanguageFileParams = { norm: NormalizedName; data: Language | undefined };

type EmitLanguageFileType = (params: EmitLanguageFileParams) => string;

const emitLanguageFile: EmitLanguageFileType = ({ norm, data }) => {
	//
	const jsonStr = stringify(data, null, 2);

	return [
		`const ${norm.varName} = ${jsonStr} as const;`,
		"\n",
		"\n",
		`type ${norm.typeName} = typeof ${norm.varName};`,
		"\n",
		"\n",
		`export { ${norm.varName} };\n`,
		`export type { ${norm.typeName} }`,
		"\n",
	].join("");
};

export { emitLanguageFile };
export type { EmitLanguageFileParams, EmitLanguageFileType };
