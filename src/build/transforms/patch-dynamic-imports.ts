import { generate } from "@babel/generator";
import { parse } from "@babel/parser";
import _traverse from "@babel/traverse";
import {
	addComment,
	callExpression,
	isIdentifier,
	isImport,
	isStringLiteral,
	isTemplateLiteral,
	templateLiteral,
} from "@babel/types";

import type { NodePath } from "@babel/traverse";
import type { CallExpression, VariableDeclarator } from "@babel/types";

// @ts-expect-error
const traverse = _traverse.default;

type PatchDynamicImportsParams = {
	content: string;
	target: string;
	replacement: string;
};

type PatchDynamicImports = (params: PatchDynamicImportsParams) => string;

const patchDynamicImports: PatchDynamicImports = ({ content, target, replacement }) => {
	//

	const ast = parse(content, {
		sourceType: "module",
		plugins: ["jsx", "typescript"],
	});

	const ignoreVars = new Set<string>();

	traverse(ast, {
		//

		VariableDeclarator(path: NodePath<VariableDeclarator>) {
			const node = path.node;

			if (isIdentifier(node.id) && isStringLiteral(node.init, { value: target })) {
				ignoreVars.add(node.id.name);

				if (path.parentPath.isVariableDeclaration()) {
					path.remove();
				}
			}
		},

		CallExpression(path: NodePath<CallExpression>) {
			const node = path.node;

			if (!isImport(node.callee)) return;

			const arg = node.arguments[0];
			if (!isTemplateLiteral(arg)) return;

			const firstExpr = arg.expressions[0];

			if (!isIdentifier(firstExpr)) return;
			if (!ignoreVars.has(firstExpr.name)) return;

			const expressions = arg.expressions.slice(1);

			const quasis = arg.quasis.slice(1);

			if (quasis.length !== expressions.length + 1) {
				throw new Error("invalid template literal struct after transform");
			}

			const rebuiltTemplate = templateLiteral(quasis, expressions);

			const newImport = callExpression(node.callee, [addComment(rebuiltTemplate, "leading", replacement, false)]);

			path.replaceWith(newImport);
		},
	});

	return generate(ast, { comments: true, minified: true }).code;
};

export { patchDynamicImports };
export type { PatchDynamicImports, PatchDynamicImportsParams };
