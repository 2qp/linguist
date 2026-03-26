import { readFile } from "node:fs/promises";
import { createCommonOptionalFieldSet } from "@gen/utils/create-common-optional-field-set";
import { getFile } from "@services/fetch/get-file";
import { getFieldsWithValueArrays } from "@tests/core/utils/get-fields-with-value-arrays";
import { describe, expect, it, test } from "vitest";
import { configLoader } from "@/infra/loaders/config-loader";
import { yamlLoader } from "@/infra/loaders/yaml-loader";

import type { LanguageData } from "@/types/lang.types";

const config = await configLoader();

const currentYaml = await getFile<string>(config.core.url, "text");

const currentData = yamlLoader<LanguageData>({ str: currentYaml });
if (!currentData) throw new Error("Unable load yaml data");

const currentFields = createCommonOptionalFieldSet({ config, source: currentData });

const baselineYaml = (await readFile("tests/fixtures/upstream.baseline.yml", "utf8")) || "";
const baselineData = yamlLoader<LanguageData>({ str: baselineYaml });
if (!baselineData) throw new Error("unable load yaml data");

const baselineFields = createCommonOptionalFieldSet({ config, source: baselineData });

describe("upstream guard test", () => {
	//

	describe("YAML / parsing safety", () => {
		test("currrent YAML parses correctly", () => {
			expect(currentData).toBeDefined();
			expect(Object.keys(currentData).length).toBeGreaterThan(0);
		});

		test("baseline YAML parses correctly", () => {
			expect(baselineData).toBeDefined();
			expect(Object.keys(baselineData).length).toBeGreaterThan(0);
		});
	});

	describe("structural / schema changes", () => {
		const criticalFields = [...baselineFields.common];

		for (let index = 0; index < criticalFields.length; index++) {
			//

			const field = criticalFields[index];
			if (!field) throw new Error(`field is null`);

			test(`critical field '${field}' exists in all languages`, () => {
				for (const langName of Object.keys(currentData)) {
					const lang = currentData[langName];
					expect(lang).toHaveProperty(field);
				}
			});
		}

		test("no unexpected fields removed", () => {
			const current = [...currentFields.common, ...currentFields.optional];
			const baseline = [...baselineFields.common, ...baselineFields.optional];

			expect([...current].sort()).toEqual(expect.arrayContaining([...baseline].sort()));
		});

		describe("field types remain consistent", () => {
			const baselineTypes = getFieldsWithValueArrays({ source: baselineData, config });
			const currentTypes = getFieldsWithValueArrays({ source: currentData, config });

			for (const [field, values] of baselineTypes) {
				it(`field "${field}" remain consistent`, () => {
					expect(values).toBeDefined();

					expect([...(currentTypes.get(field) || [])].sort()).toIncludeSupersetWithCounts([...values].sort());
				});
			}

			//
		});
	});

	describe("content / data stability", () => {
		const importantLanguages = ["JavaScript", "Python", "Go", "TypeScript"];

		test("critical languages still exist", () => {
			for (const lang of importantLanguages) {
				expect(currentData).toHaveProperty(lang);
			}
		});

		test("language count sanity check", () => {
			const count = Object.keys(currentData).length;
			const baselineCount = Object.keys(baselineData).length;
			expect(Math.abs(count - baselineCount)).toBeLessThan(50);
		});

		test("no unexpected language removals", () => {
			for (const lang of Object.keys(baselineData)) {
				expect(currentData).toHaveProperty(lang);
			}
		});

		test("track new languages (warn/fail if too many)", () => {
			const newLangs = Object.keys(currentData).filter((l) => !baselineData[l]);
			expect(newLangs.length).toBeLessThan(50);
		});
	});

	describe("upstream drift / regression", () => {
		test("detect new/removed fields", () => {
			const current = new Set([...currentFields.common, ...currentFields.optional]);
			const baseline = new Set([...baselineFields.common, ...baselineFields.optional]);

			const added = [...current].filter((f) => !baseline.has(f));
			const removed = [...baseline].filter((f) => !current.has(f));

			expect(removed.length).toBe(0);
			expect(added.length).toBeLessThan(5);
		});
	});

	describe("red flag guards", () => {
		test("check for large spike/drops in language count", () => {
			const currCount = Object.keys(currentData).length;
			const baseCount = Object.keys(baselineData).length;
			expect(Math.abs(currCount - baseCount)).toBeLessThan(50);
		});
	});
});
