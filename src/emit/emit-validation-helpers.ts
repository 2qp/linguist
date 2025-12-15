const emitValidationHelpers = (languageName: string) =>
	[
		`// Validation helpers\n `,
		`export const isValidLanguageName = (name: string): name is ${languageName} => {\n`,
		` return name in ({} as unknown as Languages);`,
		`}\n\n`,

		"\n",
		`export const getLanguage = <Name extends ${languageName}>(_name: Name): GetLanguage<Name> | undefined => {\n`,
		` // impl... \n`,
		`return undefined;\n`,
		`}\n\n`,
	].join("");

export { emitValidationHelpers };
