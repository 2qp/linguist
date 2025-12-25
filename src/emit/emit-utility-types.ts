const emitUtilityTypes = (languageName: string) =>
	[
		`// Utility types\n`,
		` export type Languages = Record<${languageName}, Language>;\n`,
		` export type LanguageField = keyof Language;\n\n`,
		` export type FallbackForUnknownKeys<T> = {
			[K in string & { __fallback?: never }]: T;
			};`,
		`\n\n`,
	].join("");

export { emitUtilityTypes };
