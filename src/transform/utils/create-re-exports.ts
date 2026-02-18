import { mkdir, stat, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { glob } from "glob";
import { createProgram, ModuleKind, ModuleResolutionKind, ScriptTarget, SymbolFlags } from "typescript";

import type { Program, SourceFile, Symbol as TsSymbol, TypeChecker } from "typescript";

type ReExportConfig = {
	outputDir?: string;
	outputFile?: string;
	perFile?: boolean;
	sourceDir?: string;
	sourcePattern?: string;
	sourceFiles?: string[];
	exclude?: string[];
	extension?: string;
	asNamespace?: boolean;
	includeDefaultExports?: boolean;
	namespaceTemplate?: (fileName: string) => string;
};

const validateConfig = (config: ReExportConfig) => {
	if (!config.sourceDir && !config.sourceFiles?.length) {
		throw new Error("either sourceDir or sourceFiles must be provided");
	}

	if (!config.perFile && !config.outputFile) {
		throw new Error("outputFile is required when perFile is false");
	}

	if (config.perFile && !config.outputDir) {
		throw new Error("outputDir is required when perFile is true");
	}
};

const findSourceFilesInDirectory = async (
	sourceDir: string,
	pattern: string = "**/*.ts",
	exclude?: string[],
): Promise<string[]> => {
	//

	const normalizedDir = resolve(sourceDir);

	if (!(await stat(normalizedDir)).isDirectory()) {
		throw new Error(`source directory does not exist: ${normalizedDir}`);
	}

	const allFiles = await glob(pattern, {
		cwd: normalizedDir,
		absolute: true,
		ignore: [...(exclude || []), "**/*.d.ts", "**/node_modules/**"],
	});

	return allFiles.filter((file) => {
		const ext = extname(file);
		return ext === ".ts" || ext === ".tsx";
	});
};

const resolveSourceFiles = async (config: ReExportConfig): Promise<string[]> => {
	//

	const filesFromDir = config.sourceDir
		? await findSourceFilesInDirectory(config.sourceDir, config.sourcePattern, config.exclude)
		: [];

	const filesFromList = config.sourceFiles || [];

	const allFiles = [...filesFromDir, ...filesFromList];

	return [...new Set(allFiles.map((f) => resolve(f)))];
};

const createTypeScriptProgram = async (sourceFiles: string[]) => {
	return createProgram(sourceFiles, {
		target: ScriptTarget.ESNext,
		module: ModuleKind.ESNext,
		moduleResolution: ModuleResolutionKind.NodeNext,
		esModuleInterop: true,
		allowSyntheticDefaultImports: true,
		strict: false,
	});
};

const shouldProcessFile = (sourceFile: SourceFile, normalizedSourceFiles: string[]): boolean => {
	//

	if (sourceFile.isDeclarationFile) return false;

	const normalizedFileName = resolve(sourceFile.fileName);
	return normalizedSourceFiles.includes(normalizedFileName);
};

const analyzeExport = (exp: TsSymbol, checker: TypeChecker) => {
	//

	const name = exp.getName();
	const isDefault = name === "default";

	if (exp.flags & SymbolFlags.Alias) {
		return analyzeAliasedExport(exp, checker, name);
	}

	const isType = (exp.flags & SymbolFlags.Type) !== 0;
	const isValue = (exp.flags & SymbolFlags.Value) !== 0;
	const isNamespace = (exp.flags & SymbolFlags.Namespace) !== 0;

	return { name, isType, isValue, isNamespace, isDefault };
};

const analyzeAliasedExport = (exp: TsSymbol, checker: TypeChecker, name: string) => {
	const aliasedSymbol = checker.getAliasedSymbol(exp);
	if (!aliasedSymbol) {
		return {
			name,
			isType: false,
			isValue: true,
			isNamespace: false,
			isDefault: name === "default",
		};
	}

	const isType = (aliasedSymbol.flags & SymbolFlags.Type) !== 0;
	const isValue = (aliasedSymbol.flags & SymbolFlags.Value) !== 0;
	const isDefault = name === "default";

	return { name, isType, isValue, isNamespace: false, isDefault };
};

const categorizeExports = (
	exports: TsSymbol[],
	checker: TypeChecker,
	config: ReExportConfig,
): { valueExports: string[]; typeExports: string[] } => {
	//

	const valueExports: string[] = [];
	const typeExports: string[] = [];

	for (const exp of exports) {
		//
		const { isType, isValue, isNamespace, name, isDefault } = analyzeExport(exp, checker);

		if (isDefault && !config.includeDefaultExports) continue;

		if (isNamespace) {
			valueExports.push(`* as ${name}`);
			continue;
		}

		if (isType && !isValue) {
			typeExports.push(name);
			continue;
		}

		valueExports.push(name);
	}

	return { typeExports, valueExports };
};

const calculateImportPath = async (
	sourceFile: SourceFile,
	outputPath: string,
	config: ReExportConfig,
): Promise<string> => {
	const isDirectory = config.perFile || extname(outputPath) === "";
	const targetDir = isDirectory ? outputPath : dirname(outputPath);

	const sourceDir = dirname(sourceFile.fileName);
	const sourceWithoutExt = basename(sourceFile.fileName, extname(sourceFile.fileName));

	const rawRelativePath = relative(targetDir, join(sourceDir, sourceWithoutExt));
	const normalizedRelativePath = rawRelativePath.replace(/\\/g, "/");

	const withLeadingDot =
		normalizedRelativePath && !normalizedRelativePath.startsWith(".") && !normalizedRelativePath.startsWith("/")
			? `./${normalizedRelativePath}`
			: normalizedRelativePath;

	const nonEmptyPath = withLeadingDot === "" ? `./${sourceWithoutExt}` : withLeadingDot;

	const sourceStats = await stat(sourceFile.fileName);

	return sourceStats.isDirectory() ? `${nonEmptyPath}/index` : nonEmptyPath;
};

const createValueExportStatement = (valueExports: string[], importPath: string) => {
	if (valueExports.length === 0) return null;

	const statement = `export { ${valueExports.join(", ")} } from "${importPath}";` as const;
	return statement;
};

const createTypeExportStatement = (typeExports: string[], importPath: string) => {
	if (typeExports.length === 0) return null;

	const statement = `export type { ${typeExports.join(", ")} } from "${importPath}";` as const;
	return statement;
};

const createExportStatements = async (
	valueExports: string[],
	typeExports: string[],
	sourceFile: SourceFile,
	outputPath: string,
	config: ReExportConfig,
): Promise<string[]> => {
	const importPath = await calculateImportPath(sourceFile, outputPath, config);

	if (config.asNamespace) {
		const namespaceName = config.namespaceTemplate
			? config.namespaceTemplate(basename(sourceFile.fileName, extname(sourceFile.fileName)))
			: `* as ${basename(sourceFile.fileName, extname(sourceFile.fileName))}`;

		return [`export ${namespaceName} from "${importPath}";`];
	}

	return [
		createValueExportStatement(valueExports, importPath),
		createTypeExportStatement(typeExports, importPath),
	].filter((statement) => statement !== null);
};

const processSourceFile = async (
	sourceFile: SourceFile,
	checker: TypeChecker,
	outputPath: string,
	config: ReExportConfig,
): Promise<string[]> => {
	//

	const symbol = checker.getSymbolAtLocation(sourceFile);
	if (!symbol) {
		console.log(`no symbol found for ${sourceFile.fileName}`);
		return [];
	}

	const exports = checker.getExportsOfModule(symbol);
	if (exports.length === 0) {
		console.log(`no exports detected for ${sourceFile.fileName}`);
		return [];
	}

	const { typeExports, valueExports } = categorizeExports(exports, checker, config);

	if (valueExports.length === 0 && typeExports.length === 0) {
		console.log(`skipping ${sourceFile.fileName} - no categorized exports`);
		return [];
	}

	return await createExportStatements(valueExports, typeExports, sourceFile, outputPath, config);
};

const writeExportFile = async (filePath: string, exportLines: string[], _config: ReExportConfig): Promise<void> => {
	//

	if (exportLines.length === 0) {
		console.warn(`no exports generated for ${filePath}`);
		return;
	}

	await mkdir(dirname(filePath), { recursive: true });
	await writeFile(filePath, `${exportLines.join("\n")}\n`, "utf8");
};

const generateSingleFileExports = async (
	program: Program,
	checker: TypeChecker,
	sourceFiles: string[],
	config: ReExportConfig,
): Promise<void> => {
	//

	if (!config.outputFile) {
		throw new Error("outputFile must be provided if its single output");
	}

	const normalizedSourceFiles = sourceFiles.map((f) => resolve(f));
	const outputFilePath = resolve(config.outputFile);

	const sourceFilesToProcess = program
		.getSourceFiles()
		.filter((sourceFile) => shouldProcessFile(sourceFile, normalizedSourceFiles));

	const exportPromises = sourceFilesToProcess.map(async (sourceFile) => {
		return await processSourceFile(sourceFile, checker, outputFilePath, config);
	});

	const exportResults = await Promise.all(exportPromises);

	const exportLines = exportResults.flat().filter((line): line is string => line !== null);

	await writeExportFile(outputFilePath, exportLines, config);
};

type CreateReExportsParams = ReExportConfig;

type CreateReExportsType = (params: CreateReExportsParams) => Promise<void>;

const createReExports: CreateReExportsType = async (config) => {
	//

	validateConfig(config);

	const sourceFiles = await resolveSourceFiles(config);
	if (sourceFiles.length === 0) {
		throw new Error("mo source files found");
	}

	const program = await createTypeScriptProgram(sourceFiles);

	const checker = program.getTypeChecker();

	if (config.perFile) return; // will do later

	await generateSingleFileExports(program, checker, sourceFiles, config);
};

export { createReExports };
export type { CreateReExportsParams, CreateReExportsType, ReExportConfig };

//
