import type { Entries } from "@/types/utility.types";
import type { _2DimensionalArray } from "../languages/data/2-dimensional-array";
import type { PublicKey } from "../languages/data/public-key";
import type { APIBlueprint } from "../languages/markup/api-blueprint";
import type { _1CEnterprise } from "../languages/programming/1c-enterprise";
import type { AGSScript } from "../languages/programming/ags-script";
import type { AIDL } from "../languages/programming/aidl";
import type { KoLmafiaASH } from "../languages/programming/kolmafia-ash";
import type { AsciiDoc } from "../languages/prose/asciidoc";
import type { Dictionary, Language, OptionalBrand } from "../types/language-types.generated";

const T1 = "@tests/fixtures/languages/programming/" as const;
const T2 = "@tests/fixtures/languages/data/" as const;
const T3 = "@tests/fixtures/languages/prose/" as const;
const T4 = "@tests/fixtures/languages/markup/" as const;

const _dynamic_by_extensions: DynamicByExtensions = {
	".bsl": [`${T1}1c-enterprise`, "_1c_enterprise"] as const,
	".2da": [`${T2}2-dimensional-array`, "_2_dimensional_array"] as const,
	".asc": [`${T1}ags-script`, "ags_script", `${T3}asciidoc`, "asciidoc", `${T2}public-key`, "public_key"] as const,
	".ash": [`${T1}ags-script`, "ags_script", `${T1}kolmafia-ash`, "kolmafia_ash"] as const,
	".aidl": [`${T1}aidl`, "aidl"] as const,
	".apib": [`${T4}api-blueprint`, "api_blueprint"] as const,
} as const;

type DynamicByExtensions = {
	".bsl": OptionalBrand<readonly string[], [_1CEnterprise]>;
	".2da": OptionalBrand<readonly string[], [_2DimensionalArray]>;
	".asc": OptionalBrand<readonly string[], [AGSScript, AsciiDoc, PublicKey]>;
	".ash": OptionalBrand<readonly string[], [AGSScript, KoLmafiaASH]>;
	".aidl": OptionalBrand<readonly string[], [AIDL]>;
	".apib": OptionalBrand<readonly string[], [APIBlueprint]>;
} & Dictionary<OptionalBrand<readonly string[], (Language | undefined)[]>>;

const dynamic_by_extensions = Object.fromEntries(
	(Object.entries(_dynamic_by_extensions) as Entries<typeof _dynamic_by_extensions>).map(([key, list]) => [
		key,
		list.flatMap((val, i) => (i % 2 === 0 ? ([`${val}?ctx=${list[i + 1]}` as const, list[i + 1]] as const) : [])),
	]),
) as unknown as DynamicByExtensions;

export { dynamic_by_extensions };
