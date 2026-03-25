import { dummyStmtPaths } from "@tests/fixtures/statements.fixture";
import { describe, expectTypeOf, it } from "vitest";
import { createStatementBuilder } from "@/transform/utils/statement/create-statement-builder";
import { createStatementPaths } from "@/transform/utils/statement/create-statement-paths";

import type { Config } from "@/types/config.types";

describe("createStatementBuilder-template literal types", async () => {
	///

	describe("import way", () => {
		//

		describe("import types way", () => {
			//

			it("infers empty { } template literal when no import types are provided", () => {
				const paths = createStatementPaths(dummyStmtPaths as Config);
				const builder = createStatementBuilder();

				const stmt_empty = builder.import().types([], []).from(paths.common).build();

				expectTypeOf(stmt_empty).toEqualTypeOf<`import type {  } from "${string}/${string}";`>();
			});

			it("infers template literal with all specified import types", () => {
				const paths = createStatementPaths(dummyStmtPaths as Config);
				const builder = createStatementBuilder();

				const stmt_filled = builder.import().types(["AceMode", "TmScopeRelax"], ["Custom"]).from(paths.common).build();

				expectTypeOf(
					stmt_filled,
				).toEqualTypeOf<`import type { AceMode, TmScopeRelax, Custom } from "${string}/${string}";`>();
			});

			it("infers template literal with widened placeholder for dynamic type names", () => {
				const paths = createStatementPaths(dummyStmtPaths as Config);
				const builder = createStatementBuilder();

				const type: string = "...";
				const stmt_dynamic = builder.import().types(["AceMode", "TmScopeRelax"], [type]).from(paths.common).build();

				expectTypeOf(
					stmt_dynamic,
				).toEqualTypeOf<`import type { AceMode, TmScopeRelax, ${string} } from "${string}/${string}";`>();
			});
		});

		describe("import values way", () => {
			//

			it("infers empty { } template literal when no values are provided", () => {
				const paths = createStatementPaths(dummyStmtPaths);
				const builder = createStatementBuilder();

				const stmt_empty = builder.import().values([]).from(paths.common).build();

				expectTypeOf(stmt_empty).toEqualTypeOf<`import {  } from "${string}/${string}";`>();
			});

			it("infers a single template literal value", () => {
				const paths = createStatementPaths(dummyStmtPaths);
				const builder = createStatementBuilder();

				const stmt_filled_one = builder.import().values(["all"]).from(paths.common).build();

				expectTypeOf(stmt_filled_one).toEqualTypeOf<`import { all } from "${string}/${string}";`>();
			});

			it("infers a template literal with a list of static values", () => {
				const paths = createStatementPaths(dummyStmtPaths);
				const builder = createStatementBuilder();

				const stmt_filled = builder.import().values(["ace_mode_array", "index_by_id"]).from(paths.common).build();

				expectTypeOf(stmt_filled).toEqualTypeOf<`import { ace_mode_array, index_by_id } from "${string}/${string}";`>();
			});

			it("infers a template literal with a widened placeholder for dynamic values", () => {
				const paths = createStatementPaths(dummyStmtPaths);
				const builder = createStatementBuilder();

				const value: string = "...";
				const stmt_dynamic_one = builder.import().values([value]).from(paths.common).build();

				expectTypeOf(stmt_dynamic_one).toEqualTypeOf<`import { ${string} } from "${string}/${string}";`>();
			});

			it("infers widened template literal placeholders for multiple dynamic values", () => {
				const paths = createStatementPaths(dummyStmtPaths);
				const builder = createStatementBuilder();

				const value: string = "...";
				const stmt_dynamic = builder.import().values([value, value]).from(paths.common).build();

				expectTypeOf(stmt_dynamic).toEqualTypeOf<`import { ${string}, ${string} } from "${string}/${string}";`>();
			});
		});

		describe("import lazy way", () => {
			describe("values", () => {
				//

				it("infers `from`, `then_` resolution", () => {
					const builder = createStatementBuilder();

					const varName = `VAR_NAME`;
					const fileName = `FILE_NAME`;

					type VarName = `VAR_NAME`;
					type FileName = `FILE_NAME`;

					const import_stmt = builder
						.import()
						.lazy()
						.values()
						.from([dummyStmtPaths.data.paths.typesDir, "/", "TYPE", "/", fileName])
						.then_(varName)
						.build();

					expectTypeOf(
						import_stmt,
					).toEqualTypeOf<`import('${string}/TYPE/${FileName}').then(({ ${VarName} }) => ${VarName})`>();
				});

				it("infers `widened` `from`, `then_` resolution", () => {
					const builder = createStatementBuilder();

					const varName: string = `...`;
					const fileName: string = `...`;

					type VarName = string;
					type FileName = string;

					const import_stmt = builder
						.import()
						.lazy()
						.values()
						.from([dummyStmtPaths.data.paths.typesDir, "/", "TYPE", "/", fileName])
						.then_(varName)
						.build();

					expectTypeOf(
						import_stmt,
					).toEqualTypeOf<`import('${string}/TYPE/${FileName}').then(({ ${VarName} }) => ${VarName})`>();
				});
			});
		});
	});

	describe("var way", () => {
		//

		describe("value way", () => {
			//

			describe("default build", () => {
				it("infers a const declaration for a value (as string) and its export", () => {
					const builder = createStatementBuilder();

					const [number, numebr_export] = builder.var("sample").value("5").build();

					expectTypeOf(number).toEqualTypeOf<`const sample = 5;`>();
					expectTypeOf(numebr_export).toEqualTypeOf<`export { sample };`>();
				});

				it("infers a const declaration for a value (as primitive) and its export", () => {
					const builder = createStatementBuilder();

					const [number, numebr_export] = builder.var("sample").value(5).build();

					expectTypeOf(number).toEqualTypeOf<`const sample = 5;`>();
					expectTypeOf(numebr_export).toEqualTypeOf<`export { sample };`>();
				});

				it("infers a widen dynamic variable names and values in const declarations and its export", () => {
					const builder = createStatementBuilder();

					const varName: string = "...";
					const value: number = 7;
					const [stmt, stmt_export] = builder.var(varName).value(value).build();

					expectTypeOf(stmt).toEqualTypeOf<`const ${string} = ${number};`>();
					expectTypeOf(stmt_export).toEqualTypeOf<`export { ${string} };`>();
				});

				it("infers a const declaration for a boolean value and its export", () => {
					const builder = createStatementBuilder();

					const [stmt, stmt_export] = builder.var("OUT").value(false).build();

					expectTypeOf(stmt).toEqualTypeOf<`const OUT = false;`>();
					expectTypeOf(stmt_export).toEqualTypeOf<`export { OUT };`>();
				});

				//

				it("infers undefined and null values in const declarations", () => {
					const builder = createStatementBuilder();

					const varName = "VAR_NAME";
					type VarName = "VAR_NAME";

					const [stmt_undefined] = builder.var(varName).value(undefined).build();
					const [stmt_null] = builder.var(varName).value(null).build();

					expectTypeOf(stmt_undefined).toEqualTypeOf<`const ${VarName} = undefined;`>();
					expectTypeOf(stmt_null).toEqualTypeOf<`const ${VarName} = null;`>();
				});
			});

			describe("type build", () => {
				it("infers the type for custom type", () => {
					const builder = createStatementBuilder();

					const varName = "VAR_NAME";
					const typeName = "SomeType";

					type VarName = "VAR_NAME";
					type TypeName = "SomeType";

					const [stmt, stmt_export] = builder.var(varName).value(5).type(typeName).build();

					expectTypeOf(stmt).toEqualTypeOf<`const ${VarName}: ${TypeName} = 5;`>();
					expectTypeOf(stmt_export).toEqualTypeOf<`export { ${VarName} };`>();
				});

				it("infers the type for string type", () => {
					const builder = createStatementBuilder();

					const varName = "VAR_NAME";
					const value = `"VALUE"`;

					type VarName = "VAR_NAME";
					type Value = `"VALUE"`;

					const [stmt_string] = builder.var(varName).value(value).type(String()).build();
					const [stmt_string_val_widened] = builder.var(varName).value(String()).type(String()).build();

					expectTypeOf(stmt_string).toEqualTypeOf<`const ${VarName}: ${string} = ${Value};`>();
					expectTypeOf(stmt_string_val_widened).toEqualTypeOf<`const ${VarName}: ${string} = ${string};`>();
				});

				it("infers the type for number type", () => {
					const builder = createStatementBuilder();

					const varName = "VAR_NAME";
					type VarName = "VAR_NAME";

					const value = 5;

					const [stmt_num] = builder.var(varName).value(value).type(Number()).build();
					const [stmt_num_val_widened] = builder.var(varName).value(Number()).type(Number()).build();

					expectTypeOf(stmt_num).toEqualTypeOf<`const ${VarName}: ${number} = 5;`>();
					expectTypeOf(stmt_num_val_widened).toEqualTypeOf<`const ${VarName}: ${number} = ${number};`>();
				});

				it("infers the type for bigInt type", () => {
					const builder = createStatementBuilder();

					const varName = "VAR_NAME";
					type VarName = "VAR_NAME";

					const [stmt_bigInt] = builder.var(varName).value(BigInt(5)).type(BigInt(5)).build();

					expectTypeOf(stmt_bigInt).toEqualTypeOf<`const ${VarName}: ${bigint} = ${bigint};`>();
				});

				it("infers the type for boolean type", () => {
					const builder = createStatementBuilder();

					const varName = "VAR_NAME";
					type VarName = "VAR_NAME";

					const [stmt_false] = builder.var(varName).value(false).type(false).build();
					const [stmt_true] = builder.var(varName).value(true).type(true).build();

					const [stmt_bool_union] = builder.var(varName).value(Boolean()).type(Boolean()).build();

					expectTypeOf(stmt_false).toEqualTypeOf<`const ${VarName}: false = false;`>();
					expectTypeOf(stmt_true).toEqualTypeOf<`const ${VarName}: true = true;`>();

					expectTypeOf(stmt_bool_union).toEqualTypeOf<
						| `const ${VarName}: false = false;`
						| `const ${VarName}: false = true;`
						| `const ${VarName}: true = false;`
						| `const ${VarName}: true = true;`
					>();
				});

				it("infers the type for falsy types", () => {
					const builder = createStatementBuilder();

					const [stmt_udefined] = builder.var("VAR_NAME").value(undefined).type(undefined).build();
					const [stmt_null] = builder.var("VAR_NAME").value(null).type(null).build();

					expectTypeOf(stmt_udefined).toEqualTypeOf<`const VAR_NAME: undefined = undefined;`>();
					expectTypeOf(stmt_null).toEqualTypeOf<`const VAR_NAME: null = null;`>();
				});

				it("infers the types for custom primitive type", () => {
					const builder = createStatementBuilder();

					const varName = "VAR_NAME";

					const [stmt_str] = builder.var(varName).value(`"VALUE"`).type("string").build();
					const [stmt_num] = builder.var(varName).value(5).type("number").build();
					const [stmt_bigInt] = builder.var(varName).value("5n").type("bigint").build();
					const [stmt_bool] = builder.var(varName).value(false).type("boolean").build();
					const [stmt_undeinfed] = builder.var(varName).value(undefined).type("undefined").build();
					const [stmt_null] = builder.var(varName).value(null).type("null").build();

					expectTypeOf(stmt_str).toEqualTypeOf<`const VAR_NAME: string = "VALUE";`>();
					expectTypeOf(stmt_num).toEqualTypeOf<`const VAR_NAME: number = 5;`>();
					expectTypeOf(stmt_bigInt).toEqualTypeOf<`const VAR_NAME: bigint = 5n;`>();
					expectTypeOf(stmt_bool).toEqualTypeOf<`const VAR_NAME: boolean = false;`>();
					expectTypeOf(stmt_undeinfed).toEqualTypeOf<`const VAR_NAME: undefined = undefined;`>();
					expectTypeOf(stmt_null).toEqualTypeOf<`const VAR_NAME: null = null;`>();
				});
			});

			describe("asConst build", () => {
				//

				it("infers the type for `asConst`", () => {
					const builder = createStatementBuilder();

					const [stmt_ref, stmt_ref_export] = builder.var("VAR_NAME").value("REF").asConst().build();

					expectTypeOf(stmt_ref).toEqualTypeOf<`const VAR_NAME = REF as const;`>();
					expectTypeOf(stmt_ref_export).toEqualTypeOf<`export { VAR_NAME };`>();
				});

				it("infers widened placeholder for string literals", () => {
					const builder = createStatementBuilder();

					const varName: string = "...";
					const value: number = 5;

					const [stmt_ref, stmt_ref_export] = builder.var(varName).value(value).asConst().build();

					expectTypeOf(stmt_ref).toEqualTypeOf<`const ${string} = ${number} as const;`>();
					expectTypeOf(stmt_ref_export).toEqualTypeOf<`export { ${string} };`>();
				});

				it("infers literal type for string literals in `asConst`", () => {
					const builder = createStatementBuilder();

					const [stmt_ref] = builder.var("VAR_NAME").value(`"VALUE"`).asConst().build();

					expectTypeOf(stmt_ref).toEqualTypeOf<`const VAR_NAME = "VALUE" as const;`>();
				});

				// TYPED
				it("infers type annotations for explicit types in `asConst`", () => {
					const builder = createStatementBuilder();

					const typeName = "SomeType" as const;
					const [stmt_ref, stmt_ref_export] = builder.var("VAR_NAME").value("REF").asConst().type(typeName).build();

					expectTypeOf(stmt_ref).toEqualTypeOf<`const VAR_NAME: SomeType = REF as const;`>();
					expectTypeOf(stmt_ref_export).toEqualTypeOf<`export { VAR_NAME };`>();
				});

				it("infers widened type annotation placeholder for explicit types in `asConst`", () => {
					const builder = createStatementBuilder();

					const typeName: string = "...";
					const [stmt] = builder.var("VAR_NAME").value(`"FOUR TET"`).asConst().type(typeName).build();

					expectTypeOf(stmt).toEqualTypeOf<`const VAR_NAME: ${string} = "FOUR TET" as const;`>();
				});

				it("infers widened variable name, type annotation and value placeholder for `asConst`", () => {
					const builder = createStatementBuilder();

					const varName: string = "...";
					const typeName: string = "...";
					const value: string = "...";

					const [stmt] = builder.var(varName).value(value).asConst().type(typeName).build();

					expectTypeOf(stmt).toEqualTypeOf<`const ${string}: ${string} = ${string} as const;`>();
				});
			});
		});

		describe("typeof way", () => {
			it("infers literal type for primary var and `typeOf` var (no widening)", () => {
				//

				const builder = createStatementBuilder();

				const [stmt, stmt_export] = builder.var("VAR_NAME").typeof("ANOTHER_VAR_NAME").build();

				expectTypeOf(stmt).toEqualTypeOf<`type ANOTHER_VAR_NAME = typeof VAR_NAME;`>();
				expectTypeOf(stmt_export).toEqualTypeOf<`export type { ANOTHER_VAR_NAME };`>();
			});

			it("infers literal type for primary var and `typeOf` var with widened placeholders", () => {
				//

				const builder = createStatementBuilder();

				const varName: string = "...";
				const typeOfVarName: string = "...";

				const [stmt, stmt_export] = builder.var(varName).typeof(typeOfVarName).build();

				expectTypeOf(stmt).toEqualTypeOf<`type ${string} = typeof ${string};`>();
				expectTypeOf(stmt_export).toEqualTypeOf<`export type { ${string} };`>();
			});
		});

		describe("prefix way", () => {
			//

			describe("asValue way", () => {
				//

				describe("default build", () => {
					it("infers the type of `var` prefixed and its export", () => {
						const builder = createStatementBuilder();

						const [stmt, stmt_export] = builder.var("VAR_NAME").prefix("PREFIX_").asValue().build();

						expectTypeOf(stmt).toEqualTypeOf<`const VAR_NAME = PREFIX_VAR_NAME;`>();
						expectTypeOf(stmt_export).toEqualTypeOf<`export { VAR_NAME };`>();
					});

					it("infers the type of `var` prefixed and its export with widened placeholders", () => {
						const builder = createStatementBuilder();

						const [stmt, stmt_export] = builder.var("VAR_NAME").prefix("PREFIX_").asValue().build();

						expectTypeOf(stmt).toEqualTypeOf<`const VAR_NAME = PREFIX_VAR_NAME;`>();
						expectTypeOf(stmt_export).toEqualTypeOf<`export { VAR_NAME };`>();
					});
				});

				describe("wrapped type build", () => {
					it("infers a template literal with a wrapped type annotation", () => {
						//
						const builder = createStatementBuilder();

						const [stmt, stmt_export] = builder
							.var("VAR_NAME")
							.prefix("PREFIX_")
							.asValue()
							.type()
							.wrap("Partial<$>")
							.types(["AceMode"], [])
							.build();

						expectTypeOf(stmt).toEqualTypeOf<`const VAR_NAME: Partial<AceMode> = PREFIX_VAR_NAME;`>();
						expectTypeOf(stmt_export).toEqualTypeOf<`export { VAR_NAME };`>();
					});

					it("infers a template literal with a unionly wrapped type annotations", () => {
						//
						const builder = createStatementBuilder();

						const [stmt, stmt_export] = builder
							.var("VAR_NAME")
							.prefix("PREFIX_")
							.asValue()
							.type()
							.wrap("ReadonlyArray<$>")
							.types(["AceMode", "Type"], ["Custom"])
							.build();

						expectTypeOf(
							stmt,
						).toEqualTypeOf<`const VAR_NAME: ReadonlyArray<AceMode | Type | Custom> = PREFIX_VAR_NAME;`>();
						expectTypeOf(stmt_export).toEqualTypeOf<`export { VAR_NAME };`>();
					});

					it("infers a template literal with a unwrapped union individual type annotations", () => {
						//
						const builder = createStatementBuilder();

						const [stmt, stmt_export] = builder
							.var("VAR_NAME")
							.prefix("PREFIX_")
							.asValue()
							.type()
							.wrap("$")
							.types(["ReadonlyArray<Group>", "ReadonlyArray<AceMode>"], ["Custom"])
							.build();

						expectTypeOf(
							stmt,
						).toEqualTypeOf<`const VAR_NAME: ReadonlyArray<Group> | ReadonlyArray<AceMode> | Custom = PREFIX_VAR_NAME;`>();
						expectTypeOf(stmt_export).toEqualTypeOf<`export { VAR_NAME };`>();
					});

					it("infers a widened template literal with a wrapped union of known and unknown placeholder type annotations", () => {
						//
						const builder = createStatementBuilder();

						const unknownType: string = "...";

						const [stmt, stmt_export] = builder
							.var("VAR_NAME")
							.prefix("PREFIX_")
							.asValue()
							.type()
							.wrap("ReadonlyArray<$>")
							.types(["AceMode"], [unknownType])
							.build();

						expectTypeOf(stmt).toEqualTypeOf<`const VAR_NAME: ReadonlyArray<AceMode | ${string}> = PREFIX_VAR_NAME;`>();
						expectTypeOf(stmt_export).toEqualTypeOf<`export { VAR_NAME };`>();
					});
				});

				describe("wrapped custom type build", () => {
					//

					it("infers a template literal with a type annotation with overidden `var` and custom `value` ", () => {
						//
						const builder = createStatementBuilder();

						const [stmt, stmt_export] = builder
							.var("VAR_NAME")
							.prefix("PREFIX_")
							.asValue()
							.type()
							.wrap("$")
							.types(["AceMode"], [])
							.custom((_exist) => ({ name: "OVERRIDEN_VAR_NAME", value: "_CUSTOM_VALUE" }))
							.build();

						expectTypeOf(stmt).toEqualTypeOf<`const OVERRIDEN_VAR_NAME: AceMode = _CUSTOM_VALUE;`>();
						expectTypeOf(stmt_export).toEqualTypeOf<`export { OVERRIDEN_VAR_NAME };`>();
					});

					it("infers a widened template literal with type annotation which overidden `var` and custom `value` ", () => {
						//
						const builder = createStatementBuilder();

						const overriddenVarName: string = "...";
						const customValue: string = "...";

						const customType: string = "...";

						const [stmt, stmt_export] = builder
							.var("VAR_NAME")
							.prefix("PREFIX_")
							.asValue()
							.type()
							.wrap("$")
							.types(["AceMode[]"], [customType])
							.custom(() => ({ name: overriddenVarName, value: customValue }))
							.build();

						expectTypeOf(stmt).toEqualTypeOf<`const ${string}: AceMode[] | ${string} = ${string};`>();
						expectTypeOf(stmt_export).toEqualTypeOf<`export { ${string} };`>();
					});
				});
			});

			describe("expression way", () => {
				//

				describe("value builder", () => {
					//

					it("infers template literal with value, prefixed var name and its export", () => {
						const builder = createStatementBuilder();

						const [stmt, stmt_export] = builder.var("VAR_NAME").prefix("PREFIX_").expr().from().value("VALUE").build();

						expectTypeOf(stmt).toEqualTypeOf<`const PREFIX_VAR_NAME = VALUE;`>();
						expectTypeOf(stmt_export).toEqualTypeOf<`export { PREFIX_VAR_NAME };`>();
					});

					it("infers widened template literal placeholders for value, prefix, var name, export", () => {
						const builder = createStatementBuilder();

						const varName: string = "...";
						const prefix: string = "...";
						const value: string = "...";

						const [stmt, stmt_export] = builder.var(varName).prefix(prefix).expr().from().value(value).build();

						expectTypeOf(stmt).toEqualTypeOf<`const ${string}${string} = ${string};`>();
						expectTypeOf(stmt_export).toEqualTypeOf<`export { ${string}${string} };`>();
					});

					it("infers template literal for var name, prefix, string value as const and export", () => {
						const builder = createStatementBuilder();

						const varName = "VAR_NAME";
						const prefix = "PREFIX_";
						const value = `"VALUE"`;

						type VarName = "VAR_NAME";
						type Prefix = "PREFIX_";
						type Value = `"VALUE"`;

						const [stmt, stmt_export] = builder
							.var(varName)
							.prefix(prefix)
							.expr()
							.from()
							.value(value)
							.asConst()
							.build();

						expectTypeOf(stmt).toEqualTypeOf<`const ${Prefix}${VarName} = ${Value} as const;`>();
						expectTypeOf(stmt_export).toEqualTypeOf<`export { ${Prefix}${VarName} };`>();
					});

					it("infers widened template literal placeholders for var name, prefix, string value as const and export", () => {
						const builder = createStatementBuilder();

						const varName: string = "...";
						const prefix: string = "...";
						const value: string = `"..."`;

						const [stmt, stmt_export] = builder
							.var(varName)
							.prefix(prefix)
							.expr()
							.from()
							.value(value)
							.asConst()
							.build();

						expectTypeOf(stmt).toEqualTypeOf<`const ${string}${string} = ${string} as const;`>();
						expectTypeOf(stmt_export).toEqualTypeOf<`export { ${string}${string} };`>();
					});

					it("infers template literal for var name, prefix, wrapped string value as const and export", () => {
						const builder = createStatementBuilder();

						const varName = "VAR_NAME";
						const prefix = "PREFIX_";
						const value = `"VALUE"`;

						type VarName = "VAR_NAME";
						type Prefix = "PREFIX_";
						type Value = `"VALUE"`;
						type WrappedValue = `() => Promise<${Value}>`;

						const [stmt, stmt_export] = builder
							.var(varName)
							.prefix(prefix)
							.expr()
							.from()
							.value(value)
							.asConst()
							.wrap("() => Promise<$>")
							.build();

						expectTypeOf(stmt).toEqualTypeOf<`const ${Prefix}${VarName} = ${WrappedValue} as const;`>();
						expectTypeOf(stmt_export).toEqualTypeOf<`export { ${Prefix}${VarName} };`>();
					});

					it("infers widened template literal placeholders for var name, prefix, wrapped string value as const and export", () => {
						const builder = createStatementBuilder();

						const varName: string = "...";
						const prefix: string = "...";
						const value: string = `"..."`;

						type WrappedValue = `() => Promise.all([ ${typeof value} ])`;

						const [stmt, stmt_export] = builder
							.var(varName)
							.prefix(prefix)
							.expr()
							.from()
							.value(value)
							.asConst()
							.wrap("() => Promise.all([ $ ])")
							.build();

						expectTypeOf(stmt).toEqualTypeOf<`const ${string}${string} = ${WrappedValue} as const;`>();
						expectTypeOf(stmt_export).toEqualTypeOf<`export { ${string}${string} };`>();
					});

					it("infers template literal for var name, prefix, value with type annotation and export", () => {
						const builder = createStatementBuilder();

						const varName = "VAR_NAME";
						const prefix = "PREFIX_";
						const value = "VALUE";
						const type = "SomeType";

						type VarName = "VAR_NAME";
						type Prefix = "PREFIX_";
						type TypeName = "SomeType";

						const [stmt, stmt_export] = builder
							.var(varName)
							.prefix(prefix)
							.expr()
							.from()
							.value(value)
							.type(type)
							.build();

						expectTypeOf(stmt).toEqualTypeOf<`const ${Prefix}${VarName}: ${TypeName} = VALUE;`>();
						expectTypeOf(stmt_export).toEqualTypeOf<`export { ${Prefix}${VarName} };`>();
					});

					it("infers widened template literal palceholders for var name, prefix, value with type annotation and export", () => {
						const builder = createStatementBuilder();

						const varName: string = "VAR_NAME";
						const prefix: string = "PREFIX_";
						const value: number = 5;
						const type: string = "SomeType";

						const [stmt, stmt_export] = builder
							.var(varName)
							.prefix(prefix)
							.expr()
							.from()
							.value(value)
							.type(type)
							.build();

						expectTypeOf(stmt).toEqualTypeOf<`const ${string}${string}: ${string} = ${number};`>();
						expectTypeOf(stmt_export).toEqualTypeOf<`export { ${string}${string} };`>();
					});
				});

				describe("tuple builder", () => {
					//

					it("infers template literal with value, prefixed var name and its export [single element tuple]", () => {
						const builder = createStatementBuilder();

						const [stmt, stmt_export] = builder
							.var("VAR_NAME")
							.prefix("PREFIX_")
							.expr()
							.from()
							.tuple(["VALUE"])
							.build();

						expectTypeOf(stmt).toEqualTypeOf<`const PREFIX_VAR_NAME = VALUE;`>();
						expectTypeOf(stmt_export).toEqualTypeOf<`export { PREFIX_VAR_NAME };`>();
					});

					it("infers widened template literal placeholders for value, prefix, var name, export [single element tuple]", () => {
						const builder = createStatementBuilder();

						const varName: string = "...";
						const prefix: string = "...";
						const value: string = "...";

						const [stmt, stmt_export] = builder.var(varName).prefix(prefix).expr().from().tuple([value]).build();

						expectTypeOf(stmt).toEqualTypeOf<`const ${string}${string} = ${string};`>();
						expectTypeOf(stmt_export).toEqualTypeOf<`export { ${string}${string} };`>();
					});

					it("infers template literal for var name, prefix, string value as const and export [single element tuple]", () => {
						const builder = createStatementBuilder();

						const varName = "VAR_NAME";
						const prefix = "PREFIX_";
						const value = `"VALUE"`;

						type VarName = "VAR_NAME";
						type Prefix = "PREFIX_";
						type Value = `"VALUE"`;

						const [stmt, stmt_export] = builder
							.var(varName)
							.prefix(prefix)
							.expr()
							.from()
							.tuple([value])
							.asConst()
							.build();

						expectTypeOf(stmt).toEqualTypeOf<`const ${Prefix}${VarName} = ${Value} as const;`>();
						expectTypeOf(stmt_export).toEqualTypeOf<`export { ${Prefix}${VarName} };`>();
					});

					it("infers widened template literal placeholders for var name, prefix, string value as const and export [single element tuple]", () => {
						const builder = createStatementBuilder();

						const varName: string = "...";
						const prefix: string = "...";
						const value: string = `"..."`;

						const [stmt, stmt_export] = builder
							.var(varName)
							.prefix(prefix)
							.expr()
							.from()
							.tuple([value])
							.asConst()
							.build();

						expectTypeOf(stmt).toEqualTypeOf<`const ${string}${string} = ${string} as const;`>();
						expectTypeOf(stmt_export).toEqualTypeOf<`export { ${string}${string} };`>();
					});

					it("infers template literal for var name, prefix, wrapped string value as const and export", () => {
						const builder = createStatementBuilder();

						const varName = "VAR_NAME";
						const prefix = "PREFIX_";
						const value = [`"VALUE_1"`, `"VALUE_2"`, "1"] as const;

						type VarName = "VAR_NAME";
						type Prefix = "PREFIX_";
						type Value = `"VALUE_1", "VALUE_2", 1`;
						type WrappedValue = `() => Promise<${Value}>`;

						const [stmt, stmt_export] = builder
							.var(varName)
							.prefix(prefix)
							.expr()
							.from()
							.tuple(value)
							.asConst()
							.wrap("() => Promise<$>")
							.build();

						expectTypeOf(stmt).toEqualTypeOf<`const ${Prefix}${VarName} = ${WrappedValue} as const;`>();
						expectTypeOf(stmt_export).toEqualTypeOf<`export { ${Prefix}${VarName} };`>();
					});

					it("infers widened template literal placeholders for var name, prefix, wrapped string value as const and export", () => {
						const builder = createStatementBuilder();

						const varName: string = "...";
						const prefix: string = "...";
						const value: [string, string, string] = ["", "", ""];

						type WrappedValue = `() => Promise.all([ ${string}, ${string}, ${string} ])`;

						const [stmt, stmt_export] = builder
							.var(varName)
							.prefix(prefix)
							.expr()
							.from()
							.tuple(value)
							.asConst()
							.wrap("() => Promise.all([ $ ])")
							.build();

						expectTypeOf(stmt).toEqualTypeOf<`const ${string}${string} = ${WrappedValue} as const;`>();
						expectTypeOf(stmt_export).toEqualTypeOf<`export { ${string}${string} };`>();
					});

					it("infers template literal for var name, prefix, value with type annotation and export [single element tuple]", () => {
						const builder = createStatementBuilder();

						const varName = "VAR_NAME";
						const prefix = "PREFIX_";
						const value = "VALUE";
						const type = "SomeType";

						type VarName = "VAR_NAME";
						type Prefix = "PREFIX_";
						type TypeName = "SomeType";

						const [stmt, stmt_export] = builder
							.var(varName)
							.prefix(prefix)
							.expr()
							.from()
							.tuple([value])
							.type(type)
							.build();

						expectTypeOf(stmt).toEqualTypeOf<`const ${Prefix}${VarName}: ${TypeName} = VALUE;`>();
						expectTypeOf(stmt_export).toEqualTypeOf<`export { ${Prefix}${VarName} };`>();
					});

					it("infers widened template literal palceholders for var name, prefix, value with type annotation and export [single element tuple]", () => {
						const builder = createStatementBuilder();

						const varName: string = "VAR_NAME";
						const prefix: string = "PREFIX_";
						const value: number = 5;
						const type: string = "SomeType";

						const [stmt, stmt_export] = builder
							.var(varName)
							.prefix(prefix)
							.expr()
							.from()
							.tuple([`${value}`])
							.type(type)
							.build();

						expectTypeOf(stmt).toEqualTypeOf<`const ${string}${string}: ${string} = ${number};`>();
						expectTypeOf(stmt_export).toEqualTypeOf<`export { ${string}${string} };`>();
					});
				});
			});

			describe("type way", () => {
				it("infers template literal for type creation with prefixed var and type", () => {
					const builder = createStatementBuilder();

					const varName = "VAR_NAME";
					const prefix = "PREFIX_";
					const type = "SomeType";

					const [stmt, stmt_export] = builder.var(varName).prefix(prefix).type(type).build();

					expectTypeOf(stmt).toEqualTypeOf<`type SomeType = PREFIX_VAR_NAME;`>();
					expectTypeOf(stmt_export).toEqualTypeOf<`export type { SomeType };`>();
				});

				it("infers widened template literal placeholders for type creation with prefixed var and type", () => {
					const builder = createStatementBuilder();

					const varName: string = "VAR_NAME";
					const prefix: string = "PREFIX_";
					const type: string = "SomeType";

					const [stmt, stmt_export] = builder.var(varName).prefix(prefix).type(type).build();

					expectTypeOf(stmt).toEqualTypeOf<`type ${string} = ${string}${string};`>();
					expectTypeOf(stmt_export).toEqualTypeOf<`export type { ${string} };`>();
				});
			});

			describe("typeof way", () => {
				//

				it("infers template literal for var creation using typeof prefixed var and value and its export", () => {
					const builder = createStatementBuilder();

					const varName = "VAR_NAME";
					type VarName = "VAR_NAME";

					const prefix = "PREFIX_";
					type Prefix = "PREFIX_";

					const [stmt, stmt_export] = builder.var(varName).prefix(prefix).typeof().build();

					expectTypeOf(stmt).toEqualTypeOf<`const ${VarName}: typeof ${Prefix}${VarName} = ${Prefix}${VarName};`>();
					expectTypeOf(stmt_export).toEqualTypeOf<`export { ${VarName} };`>();
				});

				it("infers widened template literal placehodlers for var creation using typeof prefixed var and value and its export", () => {
					const builder = createStatementBuilder();

					const varName: string = "VAR_NAME";
					const prefix: string = "PREFIX_";

					const [stmt, stmt_export] = builder.var(varName).prefix(prefix).typeof().build();

					expectTypeOf(stmt).toEqualTypeOf<`const ${string}: typeof ${string}${string} = ${string}${string};`>();
					expectTypeOf(stmt_export).toEqualTypeOf<`export { ${string} };`>();
				});

				it("infers template literal for var creation using typeof prefixed var, wrapped extended type, value and its export", () => {
					const builder = createStatementBuilder();

					const varName = "VAR_NAME";
					const prefix = "PREFIX_";

					const [stmt, stmt_export] = builder
						.var(varName)
						.prefix(prefix)
						.typeof()
						.wrap("ReadonlyArray<$>")
						.types(["AceMode"], [])
						.build();

					expectTypeOf(
						stmt,
					).toEqualTypeOf<`const VAR_NAME: typeof PREFIX_VAR_NAME & ReadonlyArray<AceMode> = PREFIX_VAR_NAME;`>();
					expectTypeOf(stmt_export).toEqualTypeOf<`export { VAR_NAME };`>();
				});

				it("infers widened template literal for var creation using typeof prefixed var, wrapped extended type, value and its export", () => {
					const builder = createStatementBuilder();

					const varName: string = "VAR_NAME";
					const prefix: string = "PREFIX_";
					const unknownType: string = "Unknown";
					const wrapper = "ReadonlyArray<$>";
					const type = "AceMode";

					const [stmt, stmt_export] = builder
						.var(varName)
						.prefix(prefix)
						.typeof()
						.wrap(wrapper)
						.types([type], [unknownType])
						.build();

					expectTypeOf(
						stmt,
					).toEqualTypeOf<`const ${string}: typeof ${string}${string} & ReadonlyArray<AceMode | ${string}> = ${string}${string};`>();
					expectTypeOf(stmt_export).toEqualTypeOf<`export { ${string} };`>();
				});

				it("infers widened template literal for var creation using typeof prefixed var, extended type, value and its export", () => {
					const builder = createStatementBuilder();

					const varName: string = "VAR_NAME";
					const prefix: string = "PREFIX_";
					const unknownType: string = "Unknown";
					const wrapper = "($)";
					const type = "AceMode";

					const [stmt, stmt_export] = builder
						.var(varName)
						.prefix(prefix)
						.typeof()
						.wrap(wrapper)
						.types([type], [unknownType])
						.build();

					expectTypeOf(
						stmt,
					).toEqualTypeOf<`const ${string}: typeof ${string}${string} & (AceMode | ${string}) = ${string}${string};`>();
					expectTypeOf(stmt_export).toEqualTypeOf<`export { ${string} };`>();
				});
			});
		});

		describe("record way", () => {
			//

			it("infers a record with `varName` and defined `tuple`", () => {
				//

				const builder = createStatementBuilder();

				const varName = "VAR_NAME";

				type VarName = "VAR_NAME";

				const [stmt, stmt_export] = builder.var(varName).record().from().tuple(["1"]).build();

				expectTypeOf(stmt).toEqualTypeOf<`const ${VarName} = { ${string} };`>();
				expectTypeOf(stmt_export).toEqualTypeOf<`export { ${VarName} };`>();
			});

			it("infers a type annotated record with `varName` and defined `tuple`", () => {
				//

				const builder = createStatementBuilder();

				const varName = `VAR_NAME`;
				const typeName = `SomeType`;

				type VarName = `VAR_NAME`;
				type TypeName = `SomeType`;

				const [stmt, stmt_export] = builder.var(varName).record().from().tuple([]).type(typeName).build();

				expectTypeOf(stmt).toEqualTypeOf<`const ${VarName}: ${TypeName} = { ${string} };`>();
				expectTypeOf(stmt_export).toEqualTypeOf<`export { ${VarName} };`>();
			});

			it("infers a readonly record with `varName` and defined `tuple`", () => {
				//

				const builder = createStatementBuilder();

				const varName = `VAR_NAME`;

				type VarName = `VAR_NAME`;

				const [stmt, stmt_export] = builder.var(varName).record().from().tuple([]).asConst().build();

				expectTypeOf(stmt).toEqualTypeOf<`const ${VarName} = { ${string} } as const;`>();
				expectTypeOf(stmt_export).toEqualTypeOf<`export { ${VarName} };`>();
			});

			it("infers a annotated readonly record with `varName` and defined `tuple`", () => {
				//

				const builder = createStatementBuilder();

				const varName = `VAR_NAME`;
				const typeName = `SomeType`;

				type VarName = `VAR_NAME`;
				type TypeName = `SomeType`;

				const [stmt, stmt_export] = builder.var(varName).record().from().tuple([]).asConst().type(typeName).build();

				expectTypeOf(stmt).toEqualTypeOf<`const ${VarName}: ${TypeName} = { ${string} } as const;`>();
				expectTypeOf(stmt_export).toEqualTypeOf<`export { ${VarName} };`>();
			});
		});
	});

	describe("type way", () => {
		//

		it("infers tempalte literal with defined type name and ref", () => {
			const builder = createStatementBuilder();

			const typeName = "SomeType";
			const ref = "REF";

			type TypeName = "SomeType";
			type Ref = "REF";

			const [stmt, stmt_export] = builder.type().alias(typeName).ref(ref).build();

			expectTypeOf(stmt).toEqualTypeOf<`type ${TypeName} = ${Ref};`>();
			expectTypeOf(stmt_export).toEqualTypeOf<`export type { ${TypeName} };`>();
		});

		it("infers widened tempalte literal placeholders for defined type name and ref", () => {
			const builder = createStatementBuilder();

			const typeName: string = "...";
			const ref: string = "...";

			const [stmt, stmt_export] = builder.type().alias(typeName).ref(ref).build();

			expectTypeOf(stmt).toEqualTypeOf<`type ${string} = ${string};`>();
			expectTypeOf(stmt_export).toEqualTypeOf<`export type { ${string} };`>();
		});

		it("infers tempalte literal with type name and wrapped type expression", () => {
			const builder = createStatementBuilder();

			const typeName = "SomeType";
			const exp = "{ key: value }";

			const [stmt, stmt_export] = builder
				.type()
				.alias(typeName)
				.exp()
				.from()
				.record(exp)
				.wrap("Dictionary<() => Promise<$>>")
				.types(["AceMode"], [])
				.build();

			expectTypeOf(stmt).toEqualTypeOf<`type SomeType = { key: value } &  Dictionary<() => Promise<AceMode>>;`>();
			expectTypeOf(stmt_export).toEqualTypeOf<`export type { SomeType };`>();
		});

		it("infers widened tempalte literal placeholders for type name, type expression and wrapped types", () => {
			const builder = createStatementBuilder();

			const typeName: string = "...";
			const exp: `{ ${string} }` = "{ ... }";
			const type: string = "...";

			const [stmt, stmt_export] = builder
				.type()
				.alias(typeName)
				.exp()
				.from()
				.record(exp)
				.wrap("Dictionary<() => Promise<$>>")
				.types(["AceMode"], [type])
				.build();

			expectTypeOf(
				stmt,
			).toEqualTypeOf<`type ${string} = { ${string} } &  Dictionary<() => Promise<AceMode | ${string}>>;`>();
			expectTypeOf(stmt_export).toEqualTypeOf<`export type { ${string} };`>();
		});

		it("infers tuple type name and wrapped type expression", () => {
			const builder = createStatementBuilder();

			const typeName = "SomeType";

			const element1 = `"0": "value",`;
			const element2 = `"1": "value",`;

			const tuple = [element1, element2] as const;

			const [stmt, stmt_export] = builder
				.type()
				.alias(typeName)
				.exp()
				.from()
				.tuple(tuple)
				.wrap("Dictionary<() => Promise<$>>")
				.types(["AceMode"], [])
				.build();

			expectTypeOf(stmt).toEqualTypeOf<`type SomeType = { ${string} } &  Dictionary<() => Promise<AceMode>>;`>();
			expectTypeOf(stmt_export).toEqualTypeOf<`export type { SomeType };`>();
		});
	});

	describe("common way", () => {
		describe("record", () => {
			//

			it("infers record syntax with key and value", () => {
				const builder = createStatementBuilder();

				const key = `KEY`;
				const value = `VALUE`;

				type Key = `"KEY"`;
				type Value = `VALUE`;

				const stmt = builder.common().record().key(key).value(value).build();

				expectTypeOf(stmt).toEqualTypeOf<`${Key}: ${Value},`>();
			});

			it("infers `widened` record syntax with key and value", () => {
				const builder = createStatementBuilder();

				const key: string = `...`;
				const value: number = 5;

				type Key = `"${string}"`;
				type Value = number;

				const stmt = builder.common().record().key(key).value(value).build();

				expectTypeOf(stmt).toEqualTypeOf<`${Key}: ${Value},`>();
			});

			it("infers wrapped record value in Promise.all", () => {
				const builder = createStatementBuilder();

				const key = `KEY`;
				const varName = `VAR_NAME`;
				const fileName = `FILE_NAME`;

				type Key = `"KEY"`;
				type VarName = `VAR_NAME`;
				type FileName = `FILE_NAME`;

				const dir: string = "";

				const import_stmt = `import('${dir}/TYPE/${fileName}').then(({ ${varName} }) => ${varName})` as const;

				const stmt = builder.common().record().key(key).wrap("() => Promise.all([ $ ])").value(import_stmt).build();

				expectTypeOf(
					stmt,
				).toEqualTypeOf<`${Key}: () => Promise.all([ import('${string}/TYPE/${FileName}').then(({ ${VarName} }) => ${VarName}) ]),`>();
			});

			it("infers `widened` wrapped record value in Promise.all", () => {
				const builder = createStatementBuilder();

				const key: string = `...`;
				const varName: string = `...`;
				const fileName: string = `...`;

				type Key = `"${string}"`;
				type VarName = `${string}`;
				type FileName = `${string}`;

				const dir: string = "";

				const import_stmt = `import('${dir}/TYPE/${fileName}').then(({ ${varName} }) => ${varName})` as const;

				const stmt = builder.common().record().key(key).wrap("() => Promise.all([ $ ])").value(import_stmt).build();

				expectTypeOf(
					stmt,
				).toEqualTypeOf<`${Key}: () => Promise.all([ import('${string}/TYPE/${FileName}').then(({ ${VarName} }) => ${VarName}) ]),`>();
			});

			it("infers wrapped record values in Promise.all", () => {
				const builder = createStatementBuilder();

				const key = `KEY`;
				const varName = `VAR_NAME`;
				const fileName = `FILE_NAME`;

				type Key = `"KEY"`;
				type VarName = `VAR_NAME`;
				type FileName = `FILE_NAME`;

				const dir: string = "";

				const import_stmt = `import('${dir}/TYPE/${fileName}').then(({ ${varName} }) => ${varName})` as const;

				const stmt = builder.common().record().key(key).wrap("() => Promise.all([ $ ])").values([import_stmt]).build();

				expectTypeOf(
					stmt,
				).toEqualTypeOf<`${Key}: () => Promise.all([ import('${string}/TYPE/${FileName}').then(({ ${VarName} }) => ${VarName}) ]),`>();
			});

			it("infers `widened` wrapped record values in Promise.all", () => {
				const builder = createStatementBuilder();

				const key: string = `...`;
				const varName: string = `...`;
				const fileName: string = `...`;

				type Key = `"${string}"`;
				type VarName = `${string}`;
				type FileName = `${string}`;

				const dir: string = "";

				const import_stmt = `import('${dir}/TYPE/${fileName}').then(({ ${varName} }) => ${varName})` as const;

				const stmt = builder.common().record().key(key).wrap("() => Promise.all([ $ ])").values([import_stmt]).build();

				expectTypeOf(
					stmt,
				).toEqualTypeOf<`${Key}: () => Promise.all([ import('${string}/TYPE/${FileName}').then(({ ${VarName} }) => ${VarName}) ]),`>();
			});
		});

		describe("tuple", () => {
			//

			it("infers tuple syntax with key and value", () => {
				const builder = createStatementBuilder();

				const key = `KEY`;
				const varName = `VAR_NAME`;

				type Key = `KEY`;
				type VarName = `VAR_NAME`;

				const stmt = builder.common().tuple().key(key).value(varName).build();

				expectTypeOf(stmt).toEqualTypeOf<readonly [Key, VarName]>();
			});

			it("infers `widened` tuple syntax with key and value", () => {
				const builder = createStatementBuilder();

				const key: string = `...`;
				const value: number = 5;

				type Key = string;
				type Value = number;

				const stmt = builder.common().tuple().key(key).value(value).build();

				expectTypeOf(stmt).toEqualTypeOf<readonly [Key, Value]>();
			});

			it("infers wrapped tuple value in Promise.all", () => {
				const builder = createStatementBuilder();

				const key = `KEY`;
				const varName = `VAR_NAME`;
				const fileName = `FILE_NAME`;

				type Key = `KEY`;
				type VarName = `VAR_NAME`;
				type FileName = `FILE_NAME`;

				const dir: string = "";

				const import_stmt = `import('${dir}/TYPE/${fileName}').then(({ ${varName} }) => ${varName})` as const;

				const stmt = builder.common().tuple().key(key).wrap("() => Promise.all([ $ ])").value(import_stmt).build();

				expectTypeOf(stmt).toEqualTypeOf<
					readonly [
						Key,
						`() => Promise.all([ import('${string}/TYPE/${FileName}').then(({ ${VarName} }) => ${VarName}) ])`,
					]
				>();
			});

			it("infers `widened` wrapped tuple value in Promise.all", () => {
				const builder = createStatementBuilder();

				const key: string = `...`;
				const varName: string = `...`;
				const fileName: string = `...`;

				type Key = string;
				type VarName = string;
				type FileName = string;

				const dir: string = "";

				const import_stmt = `import('${dir}/TYPE/${fileName}').then(({ ${varName} }) => ${varName})` as const;

				const stmt = builder.common().tuple().key(key).wrap("() => Promise.all([ $ ])").value(import_stmt).build();

				expectTypeOf(stmt).toEqualTypeOf<
					readonly [
						Key,
						`() => Promise.all([ import('${string}/TYPE/${FileName}').then(({ ${VarName} }) => ${VarName}) ])`,
					]
				>();
			});

			it("infers wrapped tuple values in Promise.all", () => {
				const builder = createStatementBuilder();

				const key = `KEY`;
				const varName = `VAR_NAME`;
				const fileName = `FILE_NAME`;

				type Key = `KEY`;
				type VarName = `VAR_NAME`;
				type FileName = `FILE_NAME`;

				const dir: string = "";

				const import_stmt = `import('${dir}/TYPE/${fileName}').then(({ ${varName} }) => ${varName})` as const;

				const stmt = builder.common().tuple().key(key).wrap("() => Promise.all([ $ ])").values([import_stmt]).build();

				expectTypeOf(stmt).toEqualTypeOf<
					readonly [
						Key,
						`() => Promise.all([ import('${string}/TYPE/${FileName}').then(({ ${VarName} }) => ${VarName}) ])`,
					]
				>();
			});

			it("infers `widened` wrapped tuple values in Promise.all", () => {
				const builder = createStatementBuilder();

				const key: string = `...`;
				const varName: string = `...`;
				const fileName: string = `...`;

				type Key = string;
				type VarName = string;
				type FileName = string;

				const dir: string = "";

				const import_stmt = `import('${dir}/TYPE/${fileName}').then(({ ${varName} }) => ${varName})` as const;

				const stmt = builder.common().tuple().key(key).wrap("() => Promise.all([ $ ])").values([import_stmt]).build();

				expectTypeOf(stmt).toEqualTypeOf<
					readonly [
						Key,
						`() => Promise.all([ import('${string}/TYPE/${FileName}').then(({ ${VarName} }) => ${VarName}) ])`,
					]
				>();
			});

			// trailing

			it("infers with trailing false in tuple", () => {
				const builder = createStatementBuilder();

				const key = `KEY`;
				const varName = `VAR_NAME`;

				type Key = `KEY`;
				type VarName = `VAR_NAME`;

				const stmt = builder.common().tuple().key(key).value(varName).trailing(false).build();

				expectTypeOf(stmt).toEqualTypeOf<readonly [Key, VarName, false]>();
			});

			it("infers with `widened` trailing false in tuple", () => {
				const builder = createStatementBuilder();

				const key: string = `...`;
				const value: string = `...`;
				const trailing: boolean = Boolean();

				type Key = string;
				type Value = string;
				type Trailing = boolean;

				const stmt = builder.common().tuple().key(key).value(value).trailing(trailing).build();

				expectTypeOf(stmt).toEqualTypeOf<readonly [Key, Value, Trailing]>();
			});

			it("infers with trailing `21` in tuple next to wrapped value", () => {
				const builder = createStatementBuilder();

				const key = `KEY`;
				const varName = `VAR_NAME`;
				const fileName = `FILE_NAME`;

				type Key = `KEY`;
				type VarName = `VAR_NAME`;
				type FileName = `FILE_NAME`;

				const dir: string = "";

				const import_stmt = `import('${dir}/TYPE/${fileName}').then(({ ${varName} }) => ${varName})` as const;

				const stmt = builder
					.common()
					.tuple()
					.key(key)
					.wrap("() => Promise.all([ $ ])")
					.value(import_stmt)
					.trailing(21)
					.build();

				expectTypeOf(stmt).toEqualTypeOf<
					readonly [
						Key,
						`() => Promise.all([ import('${string}/TYPE/${FileName}').then(({ ${VarName} }) => ${VarName}) ])`,
						21,
					]
				>();
			});

			it("infers with `widened` trailing `21` in tuple next to wrapped value", () => {
				const builder = createStatementBuilder();

				const key: string = `...`;
				const varName: string = `...`;
				const fileName: string = `...`;
				const trailing: number = 5;

				type Key = string;
				type VarName = string;
				type FileName = string;
				type Trailing = number;

				const dir: string = "";

				const import_stmt = `import('${dir}/TYPE/${fileName}').then(({ ${varName} }) => ${varName})` as const;

				const stmt = builder
					.common()
					.tuple()
					.key(key)
					.wrap("() => Promise.all([ $ ])")
					.value(import_stmt)
					.trailing(trailing)
					.build();

				expectTypeOf(stmt).toEqualTypeOf<
					readonly [
						Key,
						`() => Promise.all([ import('${string}/TYPE/${FileName}').then(({ ${VarName} }) => ${VarName}) ])`,
						Trailing,
					]
				>();
			});

			//
			it("infers with trailing `21` in tuple next to wrapped values", () => {
				const builder = createStatementBuilder();

				const key = `KEY`;
				const varName = `VAR_NAME`;
				const fileName = `FILE_NAME`;

				type Key = `KEY`;
				type VarName = `VAR_NAME`;
				type FileName = `FILE_NAME`;

				const dir: string = "";

				const import_stmt = `import('${dir}/TYPE/${fileName}').then(({ ${varName} }) => ${varName})` as const;

				const stmt = builder
					.common()
					.tuple()
					.key(key)
					.wrap("() => Promise.all([ $ ])")
					.values([import_stmt])
					.trailing(21)
					.build();

				expectTypeOf(stmt).toEqualTypeOf<
					readonly [
						Key,
						`() => Promise.all([ import('${string}/TYPE/${FileName}').then(({ ${VarName} }) => ${VarName}) ])`,
						21,
					]
				>();
			});

			it("infers with `widened` trailing `21` in tuple next to wrapped values", () => {
				const builder = createStatementBuilder();

				const key: string = `...`;
				const varName: string = `...`;
				const fileName: string = `...`;
				const trailing: number = 5;

				type Key = string;
				type VarName = string;
				type FileName = string;
				type Trailing = number;

				const dir: string = "";

				const import_stmt = `import('${dir}/TYPE/${fileName}').then(({ ${varName} }) => ${varName})` as const;

				const stmt = builder
					.common()
					.tuple()
					.key(key)
					.wrap("() => Promise.all([ $ ])")
					.values([import_stmt])
					.trailing(trailing)
					.build();

				expectTypeOf(stmt).toEqualTypeOf<
					readonly [
						Key,
						`() => Promise.all([ import('${string}/TYPE/${FileName}').then(({ ${VarName} }) => ${VarName}) ])`,
						Trailing,
					]
				>();
			});
		});
	});
});
