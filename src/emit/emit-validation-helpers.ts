const emitValidationHelpers = (languageName: string) =>
	[
		`// Validation helpers\n `,
		`export function isValidLanguageName(name: string): name is ${languageName} {\n`,
		` return name in ({} as unknown as Languages);`,
		`}\n\n`,

		"\n",
		`export function getLanguage<Name extends ${languageName}>(name: Name): GetLanguage<Name> | undefined {\n`,
		` // impl... \n`,
		`return undefined as any;\n`,
		`}\n\n`,
	].join("");

export { emitValidationHelpers };
