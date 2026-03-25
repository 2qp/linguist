import { dummyStmtPaths } from "@tests/fixtures/statements.fixture";
import { describe, expect, it } from "vitest";
import { createStatementBuilder } from "@/transform/utils/statement/create-statement-builder";
import { createStatementPaths } from "@/transform/utils/statement/create-statement-paths";

import type { Config } from "@/types/config.types";

describe("createStatementBuilder", async () => {
	///

	describe("import way", () => {
		//

		describe("import types way", () => {
			//

			it("emits right import type shell", () => {
				const paths = createStatementPaths(dummyStmtPaths as Config);
				const builder = createStatementBuilder();

				const stmt = builder.import().types([], []).from(paths.common).build();

				expect(stmt).toContain("import");
				expect(stmt).toContain("type");
				expect(stmt).toContain("from");
				expect(stmt).toContain(";");
				expect(stmt).toEqual('import type {  } from "OUT_DIR/FILE_NO_EXT";');
			});

			it("emits right import types", () => {
				const paths = createStatementPaths(dummyStmtPaths as Config);
				const builder = createStatementBuilder();

				const stmt = builder.import().types(["AceMode", "TmScopeRelax"], ["Custom"]).from(paths.common).build();

				expect(stmt).toContain("AceMode");
				expect(stmt).toContain("TmScopeRelax");
				expect(stmt).toContain("Custom");
				expect(stmt).toEqual('import type { AceMode, TmScopeRelax, Custom } from "OUT_DIR/FILE_NO_EXT";');
			});

			it("emits with empty { } when no import types are provided", () => {
				const paths = createStatementPaths(dummyStmtPaths as Config);
				const builder = createStatementBuilder();

				const stmt_empty = builder.import().types([], []).from(paths.common).build();

				expect(stmt_empty).toEqual(`import type {  } from "OUT_DIR/FILE_NO_EXT";`);
			});

			it("emits with all specified import types", () => {
				const paths = createStatementPaths(dummyStmtPaths as Config);
				const builder = createStatementBuilder();

				const stmt_filled = builder.import().types(["AceMode", "TmScopeRelax"], ["Custom"]).from(paths.common).build();

				expect(stmt_filled).toEqual(`import type { AceMode, TmScopeRelax, Custom } from "OUT_DIR/FILE_NO_EXT";`);
			});

			it("emits with dynamic type names", () => {
				const paths = createStatementPaths(dummyStmtPaths as Config);
				const builder = createStatementBuilder();

				const type: string = "SomeType";
				const stmt_dynamic = builder.import().types(["AceMode", "TmScopeRelax"], [type]).from(paths.common).build();

				expect(stmt_dynamic).toEqual(`import type { AceMode, TmScopeRelax, ${type} } from "OUT_DIR/FILE_NO_EXT";`);
			});
		});

		describe("import values way", () => {
			//

			it("emits with empty { } when no values are provided", () => {
				const paths = createStatementPaths(dummyStmtPaths);
				const builder = createStatementBuilder();

				const stmt_empty = builder.import().values([]).from(paths.common).build();

				expect(stmt_empty).toEqual(`import {  } from "OUT_DIR/FILE_NO_EXT";`);
			});

			it("emits a single value", () => {
				const paths = createStatementPaths(dummyStmtPaths);
				const builder = createStatementBuilder();

				const stmt_filled_one = builder.import().values(["all"]).from(paths.common).build();

				expect(stmt_filled_one).toEqual(`import { all } from "OUT_DIR/FILE_NO_EXT";`);
			});

			it("emits with a list of static values", () => {
				const paths = createStatementPaths(dummyStmtPaths);
				const builder = createStatementBuilder();

				const stmt_filled = builder.import().values(["ace_mode_array", "index_by_id"]).from(paths.common).build();

				expect(stmt_filled).toEqual(`import { ace_mode_array, index_by_id } from "OUT_DIR/FILE_NO_EXT";`);
			});

			it("emits with a one import value for dynamic value", () => {
				const paths = createStatementPaths(dummyStmtPaths);
				const builder = createStatementBuilder();

				const value: string = "something";
				const stmt_dynamic_one = builder.import().values([value]).from(paths.common).build();

				expect(stmt_dynamic_one).toEqual(`import { ${value} } from "OUT_DIR/FILE_NO_EXT";`);
			});

			it("emits with multiple values for multiple dynamic values", () => {
				const paths = createStatementPaths(dummyStmtPaths);
				const builder = createStatementBuilder();

				const value: string = "something";
				const value2: string = "something_else";

				const stmt_dynamic = builder.import().values([value, value2]).from(paths.common).build();

				expect(stmt_dynamic).toEqual(`import { ${value}, ${value2} } from "OUT_DIR/FILE_NO_EXT";`);
			});
		});

		describe("import lazy way", () => {
			describe("values", () => {
				//

				it("emits with `from`, `then_` resolution", () => {
					const builder = createStatementBuilder();

					const varName = "VAR_NAME";
					const fileName = "FILE_NAME";

					const import_stmt = builder
						.import()
						.lazy()
						.values()
						.from([dummyStmtPaths.data.paths.typesDir, "/", "TYPE", "/", fileName])
						.then_(varName)
						.build();

					const _varName = `VAR_NAME`;
					const _fileName = `FILE_NAME`;

					expect(import_stmt).toEqual(`import('TYPES_DIR/TYPE/${_fileName}').then(({ ${_varName} }) => ${_varName})`);
				});
			});
		});
	});

	describe("var way", () => {
		//

		describe("value way", () => {
			//

			describe("default build", () => {
				it("emits a const declaration for a value (as string) and its export", () => {
					const builder = createStatementBuilder();

					const [number, numebr_export] = builder.var("sample").value("5").build();

					expect(number).toEqual(`const sample = 5;`);
					expect(numebr_export).toEqual(`export { sample };`);
				});

				it("emits a const declaration for a value (as primitive) and its export", () => {
					const builder = createStatementBuilder();

					const [number, numebr_export] = builder.var("sample").value(5).build();

					expect(number).toEqual(`const sample = 5;`);
					expect(numebr_export).toEqual(`export { sample };`);
				});

				it("emits with a dynamic variable names and values in const declarations and its export", () => {
					const builder = createStatementBuilder();

					const varName: string = "varName";
					const value: number = 7;
					const [stmt, stmt_export] = builder.var(varName).value(value).build();

					expect(stmt).toEqual(`const ${varName} = ${value};`);
					expect(stmt_export).toEqual(`export { ${varName} };`);
				});

				it("emits a const declaration for a boolean value and its export", () => {
					const builder = createStatementBuilder();

					const varName = "OUT";

					const [stmt, stmt_export] = builder.var(varName).value(false).build();

					expect(stmt).toEqual(`const ${varName} = false;`);
					expect(stmt_export).toEqual(`export { ${varName} };`);
				});

				//

				it("emits undefined and null values in const declarations", () => {
					const builder = createStatementBuilder();

					const varName = "VAR_NAME";

					const [stmt_undefined] = builder.var(varName).value(undefined).build();
					const [stmt_null] = builder.var(varName).value(null).build();

					expect(stmt_undefined).toEqual(`const ${varName} = undefined;`);
					expect(stmt_null).toEqual(`const ${varName} = null;`);
				});
			});

			describe("type build", () => {
				it("emits the type for custom type", () => {
					const builder = createStatementBuilder();

					const varName = "VAR_NAME";
					const typeName = "SomeType";

					const [stmt, stmt_export] = builder.var(varName).value(5).type(typeName).build();

					expect(stmt).toEqual(`const ${varName}: ${typeName} = 5;`);
					expect(stmt_export).toEqual(`export { ${varName} };`);
				});

				it("emits the type for string type", () => {
					const builder = createStatementBuilder();

					const varName = "VAR_NAME";
					const type = "string";
					const value = `"VALUE"`;

					const [stmt_string] = builder.var(varName).value(value).type(type).build();

					expect(stmt_string).toEqual(`const ${varName}: ${type} = ${value};`);
				});

				it("emits the type for number type", () => {
					const builder = createStatementBuilder();

					const varName = "VAR_NAME";
					const type = "number";
					const value = 5;

					const [stmt_num] = builder.var(varName).value(value).type(type).build();

					expect(stmt_num).toEqual(`const ${varName}: ${type} = ${value};`);
				});

				it("emits the type for bigInt type", () => {
					const builder = createStatementBuilder();

					const varName = "VAR_NAME";
					const type = "bigint";
					const value = 5n;

					const [stmt_bigInt] = builder.var(varName).value(value).type(type).build();

					expect(stmt_bigInt).toEqual(`const ${varName}: ${type} = ${value};`);
				});

				it("emits the type for boolean type", () => {
					const builder = createStatementBuilder();

					const varName = "VAR_NAME";

					const [stmt_false] = builder.var(varName).value(false).type(false).build();
					const [stmt_true] = builder.var(varName).value(true).type(true).build();

					const [stmt_bool_union] = builder.var(varName).value(Boolean()).type(Boolean()).build();

					expect(stmt_false).toEqual(`const ${varName}: false = false;`);
					expect(stmt_true).toEqual(`const ${varName}: true = true;`);

					expect(stmt_bool_union).toEqual(
						expect.toBeOneOf([
							`const ${varName}: false = false;`,
							`const ${varName}: false = true;`,
							`const ${varName}: true = false;`,
							`const ${varName}: true = true;`,
						]),
					);
				});

				it("emits the type for falsy types", () => {
					const builder = createStatementBuilder();

					const varName = "VAR_NAME";

					const [stmt_udefined] = builder.var(varName).value(undefined).type(undefined).build();
					const [stmt_null] = builder.var(varName).value(null).type(null).build();

					expect(stmt_udefined).toEqual(`const VAR_NAME: undefined = undefined;`);
					expect(stmt_null).toEqual(`const VAR_NAME: null = null;`);
				});

				it("emits the types for custom primitive type", () => {
					const builder = createStatementBuilder();

					const varName = "VAR_NAME";

					const [stmt_str] = builder.var(varName).value(`"VALUE"`).type("string").build();
					const [stmt_num] = builder.var(varName).value(5).type("number").build();
					const [stmt_bigInt] = builder.var(varName).value("5n").type("bigint").build();
					const [stmt_bool] = builder.var(varName).value(false).type("boolean").build();
					const [stmt_undeinfed] = builder.var(varName).value(undefined).type("undefined").build();
					const [stmt_null] = builder.var(varName).value(null).type("null").build();

					expect(stmt_str).toEqual(`const VAR_NAME: string = "VALUE";`);
					expect(stmt_num).toEqual(`const VAR_NAME: number = 5;`);
					expect(stmt_bigInt).toEqual(`const VAR_NAME: bigint = 5n;`);
					expect(stmt_bool).toEqual(`const VAR_NAME: boolean = false;`);
					expect(stmt_undeinfed).toEqual(`const VAR_NAME: undefined = undefined;`);
					expect(stmt_null).toEqual(`const VAR_NAME: null = null;`);
				});
			});

			describe("asConst build", () => {
				//

				it("emits the type for `asConst`", () => {
					const builder = createStatementBuilder();

					const [stmt_ref, stmt_ref_export] = builder.var("VAR_NAME").value("REF").asConst().build();

					expect(stmt_ref).toEqual(`const VAR_NAME = REF as const;`);
					expect(stmt_ref_export).toEqual(`export { VAR_NAME };`);
				});

				it("emits with dynamic varName and value", () => {
					const builder = createStatementBuilder();

					const varName: string = "VAR_NAME";
					const value: number = 5;

					const [stmt_ref, stmt_ref_export] = builder.var(varName).value(value).asConst().build();

					expect(stmt_ref).toEqual(`const ${varName} = ${value} as const;`);
					expect(stmt_ref_export).toEqual(`export { ${varName} };`);
				});

				it("emits with varName and value for `asConst`", () => {
					const builder = createStatementBuilder();

					const [stmt_ref] = builder.var("VAR_NAME").value(`"VALUE"`).asConst().build();

					expect(stmt_ref).toEqual(`const VAR_NAME = "VALUE" as const;`);
				});

				// TYPED
				it("emits with static type annotations for explicit types in `asConst`", () => {
					const builder = createStatementBuilder();

					const typeName = "SomeType" as const;
					const [stmt_ref, stmt_ref_export] = builder.var("VAR_NAME").value("REF").asConst().type(typeName).build();

					expect(stmt_ref).toEqual(`const VAR_NAME: SomeType = REF as const;`);
					expect(stmt_ref_export).toEqual(`export { VAR_NAME };`);
				});

				it("emits with dynamic type annotation for explicit types in `asConst`", () => {
					const builder = createStatementBuilder();

					const typeName: string = "FOUR TET";
					const [stmt] = builder.var("VAR_NAME").value(`"FOUR TET"`).asConst().type(typeName).build();

					expect(stmt).toEqual(`const VAR_NAME: ${typeName} = "FOUR TET" as const;`);
				});

				it("emits with dynamic variable name, type annotation and value for `asConst`", () => {
					const builder = createStatementBuilder();

					const varName: string = "VAR_NAME";
					const typeName: string = "string";
					const value: string = `"DAMIEN RICE"`;

					const [stmt] = builder.var(varName).value(value).asConst().type(typeName).build();

					expect(stmt).toEqual(`const ${varName}: ${typeName} = ${value} as const;`);
				});
			});
		});

		describe("typeof way", () => {
			it("emits with static primary var and `typeOf` var", () => {
				//

				const builder = createStatementBuilder();

				const [stmt, stmt_export] = builder.var("VAR_NAME").typeof("ANOTHER_VAR_NAME").build();

				expect(stmt).toEqual(`type ANOTHER_VAR_NAME = typeof VAR_NAME;`);
				expect(stmt_export).toEqual(`export type { ANOTHER_VAR_NAME };`);
			});

			it("emits with dynamic primary var and `typeOf` var", () => {
				//

				const builder = createStatementBuilder();

				const varName: string = "SOMETHING";
				const typeOfVarName: string = "SOMETHING_ELSE";

				const [stmt, stmt_export] = builder.var(varName).typeof(typeOfVarName).build();

				expect(stmt).toEqual(`type ${typeOfVarName} = typeof ${varName};`);
				expect(stmt_export).toEqual(`export type { ${typeOfVarName} };`);
			});
		});

		describe("prefix way", () => {
			//

			describe("asValue way", () => {
				//

				describe("default build", () => {
					it("emits the type of `var` prefixed and its export", () => {
						const builder = createStatementBuilder();

						const [stmt, stmt_export] = builder.var("VAR_NAME").prefix("PREFIX_").asValue().build();

						expect(stmt).toEqual(`const VAR_NAME = PREFIX_VAR_NAME;`);
						expect(stmt_export).toEqual(`export { VAR_NAME };`);
					});

					it("emits the type of `var` prefixed and its export with widened placeholders", () => {
						const builder = createStatementBuilder();

						const varName: string = "VAR_NAME";
						const prefix: string = "PREFIX_";

						const [stmt, stmt_export] = builder.var(varName).prefix(prefix).asValue().build();

						expect(stmt).toEqual(`const VAR_NAME = PREFIX_VAR_NAME;`);
						expect(stmt_export).toEqual(`export { VAR_NAME };`);
					});
				});

				describe("wrapped type build", () => {
					it("emits with a wrapped type annotation", () => {
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

						expect(stmt).toEqual(`const VAR_NAME: Partial<AceMode> = PREFIX_VAR_NAME;`);
						expect(stmt_export).toEqual(`export { VAR_NAME };`);
					});

					it("emits with a unionly wrapped type annotations", () => {
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

						expect(stmt).toEqual(`const VAR_NAME: ReadonlyArray<AceMode | Type | Custom> = PREFIX_VAR_NAME;`);
						expect(stmt_export).toEqual(`export { VAR_NAME };`);
					});

					it("emits with a unwrapped union individual type annotations", () => {
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

						expect(stmt).toEqual(
							`const VAR_NAME: ReadonlyArray<Group> | ReadonlyArray<AceMode> | Custom = PREFIX_VAR_NAME;`,
						);
						expect(stmt_export).toEqual(`export { VAR_NAME };`);
					});

					it("emits with a wrapped union of known and unknown placeholder type annotations", () => {
						//
						const builder = createStatementBuilder();

						const unknownType: string = "SomeType";

						const [stmt, stmt_export] = builder
							.var("VAR_NAME")
							.prefix("PREFIX_")
							.asValue()
							.type()
							.wrap("ReadonlyArray<$>")
							.types(["AceMode"], [unknownType])
							.build();

						expect(stmt).toEqual(`const VAR_NAME: ReadonlyArray<AceMode | ${unknownType}> = PREFIX_VAR_NAME;`);
						expect(stmt_export).toEqual(`export { VAR_NAME };`);
					});
				});

				describe("wrapped custom type build", () => {
					//

					it("emits with a type annotation with overidden `var` and custom `value` ", () => {
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

						expect(stmt).toEqual(`const OVERRIDEN_VAR_NAME: AceMode = _CUSTOM_VALUE;`);
						expect(stmt_export).toEqual(`export { OVERRIDEN_VAR_NAME };`);
					});

					it("emits with dynamic type annotation which overidden `var` and custom `value` ", () => {
						//
						const builder = createStatementBuilder();

						const overriddenVarName: string = "OVRD_VAR_NAME";
						const customValue: string = `OVRD_VALUE_REF`;

						const customType: string = "SomeType";

						const [stmt, stmt_export] = builder
							.var("VAR_NAME")
							.prefix("PREFIX_")
							.asValue()
							.type()
							.wrap("$")
							.types(["AceMode[]"], [customType])
							.custom((prev) => ({ ...prev, name: overriddenVarName, value: customValue }))
							.build();

						expect(stmt).toEqual(`const ${overriddenVarName}: AceMode[] | ${customType} = ${customValue};`);
						expect(stmt_export).toEqual(`export { ${overriddenVarName} };`);
					});
				});
			});

			describe("expression way", () => {
				//

				describe("value builder", () => {
					//

					it("emits with value, prefixed var name and its export", () => {
						const builder = createStatementBuilder();

						const [stmt, stmt_export] = builder.var("VAR_NAME").prefix("PREFIX_").expr().from().value("VALUE").build();

						expect(stmt).toEqual(`const PREFIX_VAR_NAME = VALUE;`);
						expect(stmt_export).toEqual(`export { PREFIX_VAR_NAME };`);
					});

					it("emits with dynamic value, prefix, var name, export", () => {
						const builder = createStatementBuilder();

						const varName: string = "VAR_NAME";
						const prefix: string = "PREFIX_";
						const value: string = `"VALUE"`;

						const [stmt, stmt_export] = builder.var(varName).prefix(prefix).expr().from().value(value).build();

						expect(stmt).toEqual(`const ${prefix}${varName} = ${value};`);
						expect(stmt_export).toEqual(`export { ${prefix}${varName} };`);
					});

					it("emits with var name, prefix, string value as const and export", () => {
						const builder = createStatementBuilder();

						const varName = "VAR_NAME";
						const prefix = "PREFIX_";
						const value = `"VALUE"`;

						const [stmt, stmt_export] = builder
							.var(varName)
							.prefix(prefix)
							.expr()
							.from()
							.value(value)
							.asConst()
							.build();

						expect(stmt).toEqual(`const ${prefix}${varName} = ${value} as const;`);
						expect(stmt_export).toEqual(`export { ${prefix}${varName} };`);
					});

					it("emits with var name, prefix, wrapped string value as const and export", () => {
						const builder = createStatementBuilder();

						const varName = "VAR_NAME";
						const prefix = "PREFIX_";
						const value = `"VALUE"`;

						const wrapped = `ReadonlyArray<${value}>`;

						const [stmt, stmt_export] = builder
							.var(varName)
							.prefix(prefix)
							.expr()
							.from()
							.value(value)
							.asConst()
							.wrap("ReadonlyArray<$>")
							.build();

						expect(stmt).toEqual(`const ${prefix}${varName} = ${wrapped} as const;`);
						expect(stmt_export).toEqual(`export { ${prefix}${varName} };`);
					});

					it("emits with var name, prefix, value with type annotation and export", () => {
						const builder = createStatementBuilder();

						const varName = "VAR_NAME";
						const prefix = "PREFIX_";
						const value = "VALUE";
						const type = "SomeType";

						const [stmt, stmt_export] = builder
							.var(varName)
							.prefix(prefix)
							.expr()
							.from()
							.value(value)
							.type(type)
							.build();

						expect(stmt).toEqual(`const PREFIX_VAR_NAME: SomeType = VALUE;`);
						expect(stmt_export).toEqual(`export { PREFIX_VAR_NAME };`);
					});

					it("emits with dynamic var name, prefix, value with type annotation and export", () => {
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

						expect(stmt).toEqual(`const ${prefix}${varName}: ${type} = ${value};`);
						expect(stmt_export).toEqual(`export { ${prefix}${varName} };`);
					});
				});

				describe("tuple builder", () => {
					//

					it("emits with value, prefixed var name and its export [single element tuple]", () => {
						const builder = createStatementBuilder();

						const [stmt, stmt_export] = builder
							.var("VAR_NAME")
							.prefix("PREFIX_")
							.expr()
							.from()
							.tuple(["VALUE"])
							.build();

						expect(stmt).toEqual(`const PREFIX_VAR_NAME = VALUE;`);
						expect(stmt_export).toEqual(`export { PREFIX_VAR_NAME };`);
					});

					it("emits with dynamic value, prefix, var name, export [single element tuple]", () => {
						const builder = createStatementBuilder();

						const varName: string = "VAR_NAME";
						const prefix: string = "PREFIX_";
						const value: string = `"VALUE"`;

						const [stmt, stmt_export] = builder.var(varName).prefix(prefix).expr().from().tuple([value]).build();

						expect(stmt).toEqual(`const ${prefix}${varName} = ${value};`);
						expect(stmt_export).toEqual(`export { ${prefix}${varName} };`);
					});

					it("emits with var name, prefix, string value as const and export [single element tuple]", () => {
						const builder = createStatementBuilder();

						const varName = "VAR_NAME";
						const prefix = "PREFIX_";
						const value = `"VALUE"`;

						const [stmt, stmt_export] = builder
							.var(varName)
							.prefix(prefix)
							.expr()
							.from()
							.tuple([value])
							.asConst()
							.build();

						expect(stmt).toEqual(`const ${prefix}${varName} = ${value} as const;`);
						expect(stmt_export).toEqual(`export { ${prefix}${varName} };`);
					});

					it("emits with var name, prefix, wrapped string value as const and export ", () => {
						const builder = createStatementBuilder();

						const varName = "VAR_NAME";
						const prefix = "PREFIX_";
						const value = [`"VALUE_1"`, `"VALUE_2"`, `"VALUE_3"`] as const;

						const expected = `"VALUE_1", "VALUE_2", "VALUE_3"`;

						const wrapped = `ReadonlyArray<${expected}>`;

						const [stmt, stmt_export] = builder
							.var(varName)
							.prefix(prefix)
							.expr()
							.from()
							.tuple(value)
							.asConst()
							.wrap("ReadonlyArray<$>")
							.build();

						expect(stmt).toEqual(`const ${prefix}${varName} = ${wrapped} as const;`);
						expect(stmt_export).toEqual(`export { ${prefix}${varName} };`);
					});

					it("emits with var name, prefix, value with type annotation and export [single element tuple]", () => {
						const builder = createStatementBuilder();

						const varName = "VAR_NAME";
						const prefix = "PREFIX_";
						const value = "VALUE";
						const type = "SomeType";

						const [stmt, stmt_export] = builder
							.var(varName)
							.prefix(prefix)
							.expr()
							.from()
							.tuple([value])
							.type(type)
							.build();

						expect(stmt).toEqual(`const PREFIX_VAR_NAME: SomeType = VALUE;`);
						expect(stmt_export).toEqual(`export { PREFIX_VAR_NAME };`);
					});

					it("emits with dynamic var name, prefix, value with type annotation and export [single element tuple]", () => {
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

						expect(stmt).toEqual(`const ${prefix}${varName}: ${type} = ${value};`);
						expect(stmt_export).toEqual(`export { ${prefix}${varName} };`);
					});
				});
			});

			describe("type way", () => {
				it("emits with prefixed var and type", () => {
					const builder = createStatementBuilder();

					const varName = "VAR_NAME";
					const prefix = "PREFIX_";
					const type = "SomeType";

					const [stmt, stmt_export] = builder.var(varName).prefix(prefix).type(type).build();

					expect(stmt).toEqual(`type SomeType = PREFIX_VAR_NAME;`);
					expect(stmt_export).toEqual(`export type { SomeType };`);
				});

				it("emits with dynamic prefixed var and type", () => {
					const builder = createStatementBuilder();

					const varName: string = "VAR_NAME";
					const prefix: string = "PREFIX_";
					const type: string = "SomeType";

					const [stmt, stmt_export] = builder.var(varName).prefix(prefix).type(type).build();

					expect(stmt).toEqual(`type ${type} = ${prefix}${varName};`);
					expect(stmt_export).toEqual(`export type { ${type} };`);
				});
			});

			describe("typeof way", () => {
				//

				it("emits with prefixed var and value and its export", () => {
					const builder = createStatementBuilder();

					const varName = "VAR_NAME";

					const prefix = "PREFIX_";

					const [stmt, stmt_export] = builder.var(varName).prefix(prefix).typeof().build();

					expect(stmt).toEqual(`const ${varName}: typeof ${prefix}${varName} = ${prefix}${varName};`);
					expect(stmt_export).toEqual(`export { ${varName} };`);
				});

				it("emits with prefixed var, wrapped extended type, value and its export", () => {
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

					expect(stmt).toEqual(`const VAR_NAME: typeof PREFIX_VAR_NAME & ReadonlyArray<AceMode> = PREFIX_VAR_NAME;`);
					expect(stmt_export).toEqual(`export { VAR_NAME };`);
				});

				it("emits with dynamic prefixed var, wrapped extended type, value and its export", () => {
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

					expect(stmt).toEqual(
						`const ${varName}: typeof ${prefix}${varName} & ReadonlyArray<AceMode | ${unknownType}> = ${prefix}${varName};`,
					);
					expect(stmt_export).toEqual(`export { ${varName} };`);
				});

				it("emits with prefixed var, extended type, value and its export", () => {
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

					expect(stmt).toEqual(
						`const ${varName}: typeof ${prefix}${varName} & (AceMode | ${unknownType}) = ${prefix}${varName};`,
					);
					expect(stmt_export).toEqual(`export { ${varName} };`);
				});
			});
		});

		describe("record way", () => {
			//

			it("emits a record with `varName` and defined `tuple`", () => {
				//

				const builder = createStatementBuilder();

				const varName = "VAR_NAME";

				const element1 = `"0": "value",`;
				const element2 = `"1": "value",`;
				const tuple = [element1, element2] as const;

				const [stmt, stmt_export] = builder.var(varName).record().from().tuple(tuple).build();

				const _record = `{ "0": "value",\n"1": "value", }`;

				expect(stmt).toEqual(`const ${varName} = ${_record};`);
				expect(stmt_export).toEqual(`export { ${varName} };`);
			});

			it("emits a type annotated record with `varName` and defined `tuple`", () => {
				//

				const builder = createStatementBuilder();

				const varName = "VAR_NAME";
				const typeName = "SomeType";

				const element1 = `"0": "value",`;
				const element2 = `"1": 5,`;
				const tuple = [element1, element2] as const;

				const [stmt, stmt_export] = builder.var(varName).record().from().tuple(tuple).type(typeName).build();

				const _record = `{ "0": "value",\n"1": 5, }`;

				expect(stmt).toEqual(`const ${varName}: ${typeName} = ${_record};`);
				expect(stmt_export).toEqual(`export { ${varName} };`);
			});

			it("emits a readonly record with `varName` and defined `tuple`", () => {
				//

				const builder = createStatementBuilder();

				const varName = "VAR_NAME";

				const element1 = `"0": "value",`;
				const element2 = `"1": true,`;
				const tuple = [element1, element2] as const;

				const [stmt, stmt_export] = builder.var(varName).record().from().tuple(tuple).asConst().build();

				const _record = `{ "0": "value",\n"1": true, }`;

				expect(stmt).toEqual(`const ${varName} = ${_record} as const;`);
				expect(stmt_export).toEqual(`export { ${varName} };`);
			});

			it("emits a annotated readonly record with `varName` and defined `tuple`", () => {
				//

				const builder = createStatementBuilder();

				const varName = "VAR_NAME";
				const typeName = "SomeType";

				const element1 = `"0": "value",`;
				const element2 = `"1": true,`;
				const tuple = [element1, element2] as const;

				const [stmt, stmt_export] = builder.var(varName).record().from().tuple(tuple).asConst().type(typeName).build();

				const _record = `{ "0": "value",\n"1": true, }`;

				expect(stmt).toEqual(`const ${varName}: ${typeName} = ${_record} as const;`);
				expect(stmt_export).toEqual(`export { ${varName} };`);
			});
		});
	});

	describe("type way", () => {
		//

		it("emits with defined type name and ref", () => {
			const builder = createStatementBuilder();

			const typeName = "SomeType";
			const ref = "REF";

			const [stmt, stmt_export] = builder.type().alias(typeName).ref(ref).build();

			expect(stmt).toEqual(`type ${typeName} = ${ref};`);
			expect(stmt_export).toEqual(`export type { ${typeName} };`);
		});

		it("emits with record type name and wrapped type expression", () => {
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

			expect(stmt).toEqual(`type SomeType = { key: value } &  Dictionary<() => Promise<AceMode>>;`);
			expect(stmt_export).toEqual(`export type { SomeType };`);
		});

		it("emits with record type name, type expression and wrapped static and dynamic types", () => {
			const builder = createStatementBuilder();

			const typeName: string = "SomeType";
			const exp: `{ ${string} }` = "{ ... }";
			const type: string = "SomeCustomType";

			const [stmt, stmt_export] = builder
				.type()
				.alias(typeName)
				.exp()
				.from()
				.record(exp)
				.wrap("Dictionary<() => Promise<$>>")
				.types(["AceMode"], [type])
				.build();

			expect(stmt).toEqual(`type ${typeName} = ${exp} &  Dictionary<() => Promise<AceMode | ${type}>>;`);
			expect(stmt_export).toEqual(`export type { ${typeName} };`);
		});

		it("emits with tuple type name and wrapped type expression", () => {
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

			const expected = `"0": "value",\n"1": "value",` as const;

			expect(stmt).toEqual(`type SomeType = { ${expected} } &  Dictionary<() => Promise<AceMode>>;`);
			expect(stmt_export).toEqual(`export type { SomeType };`);
		});

		it("emits with tuple type name, type expression and wrapped static and dynamic types", () => {
			const builder = createStatementBuilder();

			const typeName: string = "SomeType";
			const type: string = "SomeCustomType";

			const element1: `"${string}": "${string}",` = `"0": "value",`;
			const element2: `"${string}": "${string}",` = `"1": "value",`;

			const tuple = [element1, element2];

			const [stmt, stmt_export] = builder
				.type()
				.alias(typeName)
				.exp()
				.from()
				.tuple(tuple)
				.wrap("Dictionary<() => Promise<$>>")
				.types(["AceMode"], [type])
				.build();

			const expected = `"0": "value",\n"1": "value",` as const;

			expect(stmt).toEqual(`type ${typeName} = { ${expected} } &  Dictionary<() => Promise<AceMode | ${type}>>;`);
			expect(stmt_export).toEqual(`export type { ${typeName} };`);
		});
	});

	describe("common way", () => {
		//

		describe("record", () => {
			//

			it("emits record syntax with key and value", () => {
				const builder = createStatementBuilder();

				const key = `KEY`;
				const value = `VALUE`;

				const stmt = builder.common().record().key(key).value(value).build();

				const _key = `"KEY"`;
				const _value = `VALUE`;

				expect(stmt).toEqual(`${_key}: ${_value},`);
			});

			it("emits wrapped record value in Promise.all", () => {
				const builder = createStatementBuilder();

				const key = "KEY";
				const varName = "VAR_NAME";
				const fileName = "FILE_NAME";

				const import_stmt =
					`import('${dummyStmtPaths.data.paths.typesDir}/TYPE/${fileName}').then(({ ${varName} }) => ${varName})` as const;

				const stmt = builder.common().record().key(key).wrap("() => Promise.all([ $ ])").value(import_stmt).build();

				const _key = `"KEY"`;
				const _varName = `VAR_NAME`;
				const _fileName = `FILE_NAME`;

				expect(stmt).toEqual(
					`${_key}: () => Promise.all([ import('TYPES_DIR/TYPE/${_fileName}').then(({ ${_varName} }) => ${_varName}) ]),`,
				);
			});

			it("emits wrapped record values in Promise.all", () => {
				const builder = createStatementBuilder();

				const key = "KEY";
				const varName = "VAR_NAME";
				const fileName = "FILE_NAME";

				const import_stmt =
					`import('${dummyStmtPaths.data.paths.typesDir}/TYPE/${fileName}').then(({ ${varName} }) => ${varName})` as const;

				const stmt = builder.common().record().key(key).wrap("() => Promise.all([ $ ])").values([import_stmt]).build();

				const _key = `"KEY"`;
				const _varName = `VAR_NAME`;
				const _fileName = `FILE_NAME`;

				expect(stmt).toEqual(
					`${_key}: () => Promise.all([ import('TYPES_DIR/TYPE/${_fileName}').then(({ ${_varName} }) => ${_varName}) ]),`,
				);
			});
		});

		describe("tuple", () => {
			//

			it("emits tuple syntax with key and value", () => {
				const builder = createStatementBuilder();

				const key = "KEY";
				const value = 5;

				const stmt = builder.common().tuple().key(key).value(value).build();

				const _key = "KEY";
				const _value = 5;

				expect(stmt).toEqual([_key, _value]);
			});

			it("emits wrapped tuple value in Promise.all", () => {
				const builder = createStatementBuilder();

				const key = "KEY";
				const varName = "VAR_NAME";
				const fileName = "FILE_NAME";

				const import_stmt =
					`import('${dummyStmtPaths.data.paths.typesDir}/TYPE/${fileName}').then(({ ${varName} }) => ${varName})` as const;

				const stmt = builder.common().tuple().key(key).wrap("() => Promise.all([ $ ])").value(import_stmt).build();

				const _key = "KEY";
				const _varName = "VAR_NAME";
				const _fileName = "FILE_NAME";

				expect(stmt).toEqual([
					_key,
					`() => Promise.all([ import('TYPES_DIR/TYPE/${_fileName}').then(({ ${_varName} }) => ${_varName}) ])`,
				]);
			});

			it("emits wrapped tuple values in Promise.all", () => {
				const builder = createStatementBuilder();

				const key = "KEY";
				const varName = "VAR_NAME";
				const fileName = "FILE_NAME";

				const import_stmt =
					`import('${dummyStmtPaths.data.paths.typesDir}/TYPE/${fileName}').then(({ ${varName} }) => ${varName})` as const;

				const stmt = builder.common().tuple().key(key).wrap("() => Promise.all([ $ ])").values([import_stmt]).build();

				const _key = "KEY";
				const _varName = "VAR_NAME";
				const _fileName = "FILE_NAME";

				expect(stmt).toEqual([
					_key,
					`() => Promise.all([ import('TYPES_DIR/TYPE/${_fileName}').then(({ ${_varName} }) => ${_varName}) ])`,
				]);
			});

			// trailing

			it("emits with trailing false in tuple", () => {
				const builder = createStatementBuilder();

				const key = "KEY";
				const value = `VALUE`;

				const stmt = builder.common().tuple().key(key).value(value).trailing(false).build();

				const _key = "KEY";
				const _value = `VALUE`;

				expect(stmt).toEqual([_key, _value, false]);
			});

			it("emits with trailing `21` in tuple next to wrapped value", () => {
				const builder = createStatementBuilder();

				const key = "KEY";
				const varName = "VAR_NAME";
				const fileName = "FILE_NAME";
				const trailing = 21;

				const import_stmt =
					`import('${dummyStmtPaths.data.paths.typesDir}/TYPE/${fileName}').then(({ ${varName} }) => ${varName})` as const;

				const stmt = builder
					.common()
					.tuple()
					.key(key)
					.wrap("() => Promise.all([ $ ])")
					.value(import_stmt)
					.trailing(trailing)
					.build();

				const _key = "KEY";
				const _varName = "VAR_NAME";
				const _fileName = "FILE_NAME";
				const _trailing = 21;

				expect(stmt).toEqual([
					_key,
					`() => Promise.all([ import('TYPES_DIR/TYPE/${_fileName}').then(({ ${_varName} }) => ${_varName}) ])`,
					_trailing,
				]);
			});

			it("emits with trailing `21` in tuple next to wrapped values", () => {
				const builder = createStatementBuilder();

				const key = "KEY";
				const varName = "VAR_NAME";
				const fileName = "FILE_NAME";
				const trailing = 21;

				const import_stmt =
					`import('${dummyStmtPaths.data.paths.typesDir}/TYPE/${fileName}').then(({ ${varName} }) => ${varName})` as const;

				const stmt = builder
					.common()
					.tuple()
					.key(key)
					.wrap("() => Promise.all([ $ ])")
					.values([import_stmt])
					.trailing(trailing)
					.build();

				const _key = "KEY";
				const _varName = "VAR_NAME";
				const _fileName = "FILE_NAME";
				const _trailing = 21;

				expect(stmt).toEqual([
					_key,
					`() => Promise.all([ import('TYPES_DIR/TYPE/${_fileName}').then(({ ${_varName} }) => ${_varName}) ])`,
					_trailing,
				]);
			});
		});
	});
});
