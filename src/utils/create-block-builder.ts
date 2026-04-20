import type { Block } from "@/types/transform.types";

const buildWithGroups = (blocks: Block[], index = 0, _lastGroup?: string): string => {
	//

	if (index >= blocks.length) return "";

	const current = blocks[index];
	if (!current) return "";

	const currentCode = current.code;
	const nextBlock = blocks[index + 1];

	const rest = buildWithGroups(blocks, index + 1, current.group);

	if (!nextBlock) return currentCode;

	// const separator = current.group && current.group === lastGroup ? "\n" : "\n\n";

	const separator = current.group && current.group === nextBlock.group ? "\n" : "\n\n";

	return currentCode + separator + rest;
};

const createBlockBuilder = (initial: Block[] = []) => {
	//

	const blocks = initial;

	const add = (block: Block) => createBlockBuilder([...blocks, block]);

	return {
		//

		import: (code: string, import_kind: "value" | "type" = "value", group?: string) =>
			add({ kind: "import", code, import_kind, group }),

		expr: (code: string, prefixed = false) => add({ kind: "expr", code, prefixed }),

		type: (code: string, prefixed = false) => add({ kind: "type", code, prefixed }),

		meta: (code: string) => add({ kind: "meta", code }),

		exportExpr: (code: string, prefixed = false) => add({ kind: "expr", code, prefixed, export: true }),

		exportType: (code: string, prefixed = false) => add({ kind: "type", code, prefixed, export: true }),

		exportMeta: (code: string) => add({ kind: "meta", code, export: true }),

		getBlocks: () => blocks,

		build: () => buildWithGroups(blocks),
	};
};

type CreateBlockBuilder = ReturnType<typeof createBlockBuilder>;

export { createBlockBuilder };
export type { CreateBlockBuilder };
