import { resolvePath } from "@utils/resolve-path";
import { createTypeAsStringBuilder } from "@/transform/utils/create-re-exports";

const emitUtilityTypes = async (languageName: string) => {
	//

	const dictionaryBuilder = await createTypeAsStringBuilder("src/types/utility.types.ts", "Dictionary", {
		sourceDir: resolvePath("src/types"),
		sourcePattern: "utility.types.ts",
		exported: true,
	});

	const dictionary = dictionaryBuilder?.addExport().build();

	return [
		`// Utility types\n`,
		`export type Languages = Record<${languageName}, Language>;\n`,
		`export type LanguageField = keyof Language;\n\n`,

		`${dictionary}`,
		`\n\n`,
	].join("");
};

export { emitUtilityTypes };
