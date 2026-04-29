import { mkdir, stat, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, normalize, relative, resolve, sep } from "node:path";
import { glob } from "glob";
import {
	createPrinter,
	createProgram,
	EmitHint,
	factory,
	forEachChild,
	isExportDeclaration,
	isExportSpecifier,
	isIdentifier,
	isInterfaceDeclaration,
	isTypeAliasDeclaration,
	isTypeOperatorNode,
	isVariableDeclaration,
	isVariableStatement,
	ModuleKind,
	ModuleResolutionKind,
	NewLineKind,
	ScriptTarget,
	SymbolFlags,
	SyntaxKind,
} from "typescript";

import type {
	InterfaceDeclaration,
	Node,
	Program,
	SourceFile,
	Symbol as TsSymbol,
	TypeAliasDeclaration,
	TypeChecker,
} from "typescript";

type Depth = "all" | "shallow" | "deep";

type BarrelOptions = {
	depth?: Depth;
	multi?: boolean;
	recursive?: boolean;
};

type Variant = "barrel" | "per-file";

type ReExportConfig = {
	outputDir?: string;
	outputFile?: string;
	perFile?: boolean;
	barrel?: boolean;
	barrel_options?: BarrelOptions;
	sourceDir?: string;
	sourcePattern?: string;
	sourceFiles?: string[];
	exclude?: string[];
	extension?: string;
	asNamespace?: boolean;
	includeDefaultExports?: boolean;
	exported?: boolean;
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
	//

	const isTypeOnlyExport = isExportedAsTypeOnly(exp);

	if (isTypeOnlyExport) {
		return {
			name,
			isType: true,
			isValue: false,
			isNamespace: false,
			isDefault: name === "default",
		};
	}

	const aliasedSymbol = checker.getAliasedSymbol(exp);

	if (aliasedSymbol?.declarations) {
		const isType = (aliasedSymbol.flags & SymbolFlags.Type) !== 0;
		const isValue = (aliasedSymbol.flags & SymbolFlags.Value) !== 0;
		const isDefault = name === "default";
		return { name, isType, isValue, isNamespace: false, isDefault };
	}

	const isDefault = name === "default";

	return { name, isType: false, isValue: true, isNamespace: false, isDefault };
};

const isExportedAsTypeOnly = (symbol: TsSymbol): boolean => {
	const declarations = symbol.getDeclarations();
	if (!declarations) return false;

	return declarations.some(isTypeOnlyDeclaration);
};

const isTypeOnlyDeclaration = (node: Node): boolean =>
	(isExportSpecifier(node) && node.isTypeOnly) || (node.parent !== undefined && isTypeOnlyAncestor(node.parent));

const isTypeOnlyAncestor = (node: Node): boolean =>
	(isExportDeclaration(node) && node.isTypeOnly) || (node.parent !== undefined && isTypeOnlyAncestor(node.parent));

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
	variant: Variant = "barrel",
): Promise<string> => {
	const isDirectory = config.perFile || extname(outputPath) === "";
	const baseTargetDir = isDirectory ? outputPath : dirname(outputPath);

	const sourceDir = dirname(sourceFile.fileName);
	const sourceWithoutExt = basename(sourceFile.fileName, extname(sourceFile.fileName));

	const targetDir =
		variant === "per-file" && config.sourceDir
			? join(baseTargetDir, relative(resolve(config.sourceDir), sourceDir))
			: baseTargetDir;

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
	variant: Variant,
): Promise<string[]> => {
	const importPath = await calculateImportPath(sourceFile, outputPath, config, variant);

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
	variant: Variant,
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

	return await createExportStatements(valueExports, typeExports, sourceFile, outputPath, config, variant);
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

const filterFiles = (files: string[], sourceDir?: string, options: BarrelOptions = {}) => {
	//

	if (!sourceDir) return files;

	const { depth = "all" } = options;

	return files.filter((file) => {
		const rel = relative(sourceDir, file);

		if (!rel || rel.startsWith("..")) return false;

		const isDirectChild = !rel.includes(sep);

		if (depth === "shallow") return isDirectChild;
		if (depth === "deep") return !isDirectChild;

		return true;
	});
};

const createBarrels = async (
	sourceFiles: ReadonlyArray<SourceFile>,
	normalizedFiles: string[],
	outputFilePath: string,
	checker: TypeChecker,
	config: ReExportConfig,
) => {
	//

	if (config.barrel && config.barrel_options?.multi) {
		//

		if (!config.outputDir) throw new Error("outputDir must be provided, if its multi barrel");

		const files = filterFiles(normalizedFiles, config.sourceDir, { depth: "deep" });
		const sf = sourceFiles.filter((sourceFile) => shouldProcessFile(sourceFile, files));

		const exportPromises = sf.map(async (s) => await processSourceFile(s, checker, outputFilePath, config, "per-file"));

		const exportResults = await Promise.all(exportPromises);
		const exportLines = exportResults.flat().filter((line): line is string => line !== null);

		const resolvedSourceDir = resolve(config.sourceDir || "");
		const outputDir = config.outputDir;

		const writePromises = files.map(async (f) => {
			const sourceFileDir = dirname(f);
			const relativeDir = relative(resolvedSourceDir, sourceFileDir);
			const file = join(outputDir, relativeDir, `index.ts`);

			return await writeExportFile(file, exportLines, config);
		});

		await Promise.all(writePromises);
	}
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

	const source_files = program.getSourceFiles();

	const normalizedSourceFiles_ = sourceFiles.map((f) => resolve(f));
	const normalizedSourceFiles = filterFiles(normalizedSourceFiles_, config.sourceDir, config.barrel_options);

	const outputFilePath = resolve(config.outputFile);

	const sourceFilesToProcess = source_files.filter((sourceFile) =>
		shouldProcessFile(sourceFile, normalizedSourceFiles),
	);

	const exportPromises = sourceFilesToProcess.map(
		async (sourceFile) => await processSourceFile(sourceFile, checker, outputFilePath, config, "barrel"),
	);

	const exportResults = await Promise.all(exportPromises);

	const exportLines = exportResults.flat().filter((line): line is string => line !== null);

	await writeExportFile(outputFilePath, exportLines, config);

	if (config.barrel && config.barrel_options?.multi) {
		//

		await createBarrels(source_files, normalizedSourceFiles_, outputFilePath, checker, config);
	}
};

const generatePerFileExports = async (
	program: Program,
	checker: TypeChecker,
	sourceFiles: string[],
	config: ReExportConfig,
): Promise<void> => {
	//

	if (!config.outputDir) {
		throw new Error("outputDir must be provided if its per file output");
	}

	if (!config.sourceDir) {
		throw new Error("sourceDir must be provided if its per file output");
	}

	const normalizedSourceFiles = sourceFiles.map((f) => resolve(f));
	const outputDir = resolve(config.outputDir);
	const extension = config.extension || ".ts";

	const processFile = async (sourceFile: SourceFile) => {
		//

		if (!shouldProcessFile(sourceFile, normalizedSourceFiles)) return;

		const statements = await processSourceFile(sourceFile, checker, outputDir, config, "per-file");

		if (statements.length === 0) return;

		if (!config.sourceDir) throw new Error("sourceDir must be provided if its per file output");

		const outputFileName = getOutputFileName(sourceFile, outputDir, extension, config.sourceDir);

		await writeExportFile(outputFileName, statements, config);
	};

	await Promise.all(program.getSourceFiles().map(processFile));
};

const getOutputFileName = (sourceFile: SourceFile, outputDir: string, extension: string, sourceDir: string): string => {
	const sourceFileName = basename(sourceFile.fileName, extname(sourceFile.fileName));

	const sourceFileDir = dirname(sourceFile.fileName);
	const resolvedSourceDir = resolve(sourceDir);
	const relativeDir = relative(resolvedSourceDir, sourceFileDir);

	return join(outputDir, relativeDir, `${sourceFileName}${extension}`);
};

const addExport = (decl: InterfaceDeclaration | TypeAliasDeclaration) => {
	//

	const exportModifier = factory.createModifier(SyntaxKind.ExportKeyword);

	if (isInterfaceDeclaration(decl)) {
		return factory.updateInterfaceDeclaration(
			decl,
			[exportModifier],
			decl.name,
			decl.typeParameters,
			decl.heritageClauses,
			decl.members,
		);
	}

	if (isTypeAliasDeclaration(decl)) {
		return factory.updateTypeAliasDeclaration(decl, [exportModifier], decl.name, decl.typeParameters, decl.type);
	}

	return decl;
};

const findTypeDeclaration = (
	sourceFile: SourceFile,
	typeName: string,
	checker: TypeChecker,
): TypeAliasDeclaration | InterfaceDeclaration | null => {
	//

	const symbols = checker.getSymbolsInScope(
		sourceFile,
		SymbolFlags.Type | SymbolFlags.TypeAlias | SymbolFlags.Interface,
	);

	const symbol = symbols.find((s) => s.name === typeName);

	if (symbol?.declarations) {
		for (const decl of symbol.declarations) {
			if (isTypeAliasDeclaration(decl) || isInterfaceDeclaration(decl)) {
				return decl;
			}
		}
	}

	return null;
};

const createTypeAsStringBuilder = async (filePath: string, typeName: string, config: ReExportConfig) => {
	//

	const sourceFiles = await resolveSourceFiles(config);

	const program = await createTypeScriptProgram(sourceFiles);

	const sourceFile = program.getSourceFiles().find((sf) => {
		//

		const normalizedFileName = normalize(sf.fileName);
		const normalizedFilePath = normalize(filePath);

		return normalizedFileName === normalizedFilePath || normalizedFileName.endsWith(normalizedFilePath);
	});

	if (!sourceFile) return null;

	const checker = program.getTypeChecker();

	const typeDeclaration = findTypeDeclaration(sourceFile, typeName, checker);

	if (!typeDeclaration) return null;

	const printer = createPrinter({ newLine: NewLineKind.LineFeed, removeComments: false });

	// const result = printer.printNode(EmitHint.Unspecified, typeDeclWithExportsOrNot, sourceFile);

	return {
		//

		build: () => {
			const result = printer.printNode(EmitHint.Unspecified, typeDeclaration, sourceFile);
			return result;
		},

		addExport: () => ({
			build: () => {
				const declWithExport = addExport(typeDeclaration);
				const result = printer.printNode(EmitHint.Unspecified, declWithExport, sourceFile);
				return result;
			},
		}),
	};
};

const extractBrandSymbol = (
	sourceFile: SourceFile,
	targetName: string,
): { statement: string; node: Node } | null | undefined => {
	//

	const findNode = (node: Node): Node | null | undefined => {
		//

		if (isVariableStatement(node)) {
			const hasDeclare = node.modifiers?.some((m) => m.kind === SyntaxKind.DeclareKeyword);

			if (hasDeclare) {
				const decl = node.declarationList.declarations[0];

				if (
					decl &&
					isVariableDeclaration(decl) &&
					isIdentifier(decl.name) &&
					decl.name.text === targetName &&
					decl.type &&
					isTypeOperatorNode(decl.type) &&
					decl.type.operator === SyntaxKind.UniqueKeyword &&
					decl.type.type &&
					decl.type.type.kind === SyntaxKind.SymbolKeyword
				) {
					return node;
				}
			}
		}

		return forEachChild(node, findNode);
	};

	const foundNode = findNode(sourceFile);

	if (foundNode) {
		const printer = createPrinter();

		return {
			statement: printer.printNode(EmitHint.Unspecified, foundNode, sourceFile),
			node: foundNode,
		};
	}

	return null;
};

const getSymbolAsString = async (filePath: string, symbolName: string, config: ReExportConfig) => {
	//

	const sourceFiles = await resolveSourceFiles(config);

	const program = await createTypeScriptProgram(sourceFiles);

	const sourceFile = program.getSourceFiles().find((sf) => {
		//

		const normalizedFileName = normalize(sf.fileName);
		const normalizedFilePath = normalize(filePath);

		return normalizedFileName === normalizedFilePath || normalizedFileName.endsWith(normalizedFilePath);
	});

	if (!sourceFile) return null;

	return extractBrandSymbol(sourceFile, symbolName);
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

	if (config.barrel && config.perFile) {
		//

		await Promise.all([
			generateSingleFileExports(program, checker, sourceFiles, { ...config, perFile: false }),
			generatePerFileExports(program, checker, sourceFiles, config),
		]);

		return;
	}

	if (config.perFile) {
		await generatePerFileExports(program, checker, sourceFiles, config);
		return;
	}

	await generateSingleFileExports(program, checker, sourceFiles, config);
};

export { createReExports, createTypeAsStringBuilder, getSymbolAsString };
export type { CreateReExportsParams, CreateReExportsType, ReExportConfig };

//
