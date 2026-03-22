import { resolvePath } from "@utils/resolve-path";
import { getTypeAsString } from "@/transform/utils/create-re-exports";

const emitUtilityTypes = async (languageName: string) => {
	//

	const dictionary = await getTypeAsString("src/types/utility.types.ts", "Dictionary", {
		sourceDir: resolvePath("src/types"),
		sourcePattern: "utility.types.ts",
	});

	return [
		`// Utility types\n`,
		`export type Languages = Record<${languageName}, Language>;\n`,
		`export type LanguageField = keyof Language;\n\n`,

		`export ${dictionary}`,
		`\n\n`,
	].join("");
};

export { emitUtilityTypes };
