import { normalizeName } from "./normalize-name";

import type { Config } from "@/types/config.types";

type CreateStatementsParams<TName extends string = string> = { name: TName; obj: string; config: Config };

// type CreateStatements = <const TName extends string>(params: CreateStatementsParams<TName>) => void;

const createStatements = <const TName extends string>({ name, obj }: CreateStatementsParams<TName>) => {
	//

	const { varName, typeName } = normalizeName(name);

	const raw = `const ${varName} = ${obj} as const;` as const;

	const typeSt = `type ${typeName} = typeof ${varName};` as const;

	const exportVar = `export { ${varName} };` as const;

	const exportVarType = `export type { ${typeName} };` as const;

	return [raw, typeSt, exportVar, exportVarType] as const;
};

export { createStatements };
export type { CreateStatementsParams };
