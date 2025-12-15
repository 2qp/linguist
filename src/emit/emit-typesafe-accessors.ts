const emitTypeSafeAccessors = (languageName: string) =>
	[
		`// Type-safe accessors\n`,
		`export type GetLanguage<Name extends ${languageName}> = Languages[Name];\n`,
		`export type GetLanguageField<Name extends ${languageName}, Field extends LanguageField> = Languages[Name][Field];\n`,
		`export type GetLanguagesByType<Type extends (Language['type'] extends infer T ? T : never)> = {\n`,
		`[K in ${languageName} as Languages[K]['type'] extends Type ? K : never]: Languages[K];\n`,
		`};\n\n`,
	].join("");

export { emitTypeSafeAccessors };
