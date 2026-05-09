import type { Entries } from "@/types/utility.types";
import type { _2DimensionalArray } from "../languages/data/2-dimensional-array";
import type { PublicKey } from "../languages/data/public-key";
import type { APIBlueprint } from "../languages/markup/api-blueprint";
import type { _1CEnterprise } from "../languages/programming/1c-enterprise";
import type { AGSScript } from "../languages/programming/ags-script";
import type { KoLmafiaASH } from "../languages/programming/kolmafia-ash";
import type { AsciiDoc } from "../languages/prose/asciidoc";
import type { Dictionary, Language, OptionalBrand } from "../types/language-types.generated";

const T1 = "@tests/fixtures/languages/programming/" as const;
const T2 = "@tests/fixtures/languages/data/" as const;
const T3 = "@tests/fixtures/languages/markup/" as const;
const T4 = "@tests/fixtures/languages/prose/" as const;

const _dynamic_by_name: DynamicByName = {
	"1C Enterprise": [`${T1}1c-enterprise`, "_1c_enterprise"],
	"2-Dimensional Array": [`${T2}2-dimensional-array`, "_2_dimensional_array"],
	AIDL: [`${T1}aidl`, "aidl"],
	"AGS Script": [`${T1}ags-script`, "ags_script"],
	"API Blueprint": [`${T3}api-blueprint`, "api_blueprint"],
	"Public Key": [`${T2}public-key`, "public_key"],
	"KoLmafia ASH": [`${T1}kolmafia-ash`, "kolmafia_ash"],
	AsciiDoc: [`${T4}asciidoc`, "asciidoc"],
} as const;

type DynamicByName = {
	"1C Enterprise": OptionalBrand<readonly [string, string], readonly [_1CEnterprise]>;
	"2-Dimensional Array": OptionalBrand<readonly [string, string], readonly [_2DimensionalArray]>;
	AsciiDoc: OptionalBrand<readonly [string, string], readonly [AsciiDoc]>;
	"AGS Script": OptionalBrand<readonly [string, string], readonly [AGSScript]>;
	"Public Key": OptionalBrand<readonly [string, string], readonly [PublicKey]>;
	"KoLmafia ASH": OptionalBrand<readonly [string, string], readonly [KoLmafiaASH]>;
	"API Blueprint": OptionalBrand<readonly [string, string], readonly [APIBlueprint]>;
} & Dictionary<OptionalBrand<readonly [string, string], readonly [Language] | readonly []>>;

const dynamic_by_name = Object.fromEntries(
	(Object.entries(_dynamic_by_name) as Entries<typeof _dynamic_by_name>).map(
		([key, [path, _export]]) => [key, [`${path}?ctx=${_export}`, _export]] as const,
	),
) as DynamicByName;

export { dynamic_by_name };
