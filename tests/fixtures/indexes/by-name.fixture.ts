import { _2_dimensional_array } from "../languages/data/2-dimensional-array";
import { public_key } from "../languages/data/public-key";
import { api_blueprint } from "../languages/markup/api-blueprint";
import { _1c_enterprise } from "../languages/programming/1c-enterprise";
import { ags_script } from "../languages/programming/ags-script";
import { aidl } from "../languages/programming/aidl";
import { kolmafia_ash } from "../languages/programming/kolmafia-ash";
import { asciidoc } from "../languages/prose/asciidoc";

import type { _2DimensionalArray } from "../languages/data/2-dimensional-array";
import type { PublicKey } from "../languages/data/public-key";
import type { APIBlueprint } from "../languages/markup/api-blueprint";
import type { _1CEnterprise } from "../languages/programming/1c-enterprise";
import type { AGSScript } from "../languages/programming/ags-script";
import type { AIDL } from "../languages/programming/aidl";
import type { KoLmafiaASH } from "../languages/programming/kolmafia-ash";
import type { AsciiDoc } from "../languages/prose/asciidoc";
import type { Dictionary, Language } from "../types/language-types.generated";

const by_name: ByName = {
	"1C Enterprise": _1c_enterprise,
	"2-Dimensional Array": _2_dimensional_array,
	AIDL: aidl,
	"AGS Script": ags_script,
	"API Blueprint": api_blueprint,
	AsciiDoc: asciidoc,
	"Public Key": public_key,
	"KoLmafia ASH": kolmafia_ash,
} as const;

type ByName = {
	"1C Enterprise": _1CEnterprise;
	"2-Dimensional Array": _2DimensionalArray;
	"AGS Script": AGSScript;
	AIDL: AIDL;
	"API Blueprint": APIBlueprint;
	AsciiDoc: AsciiDoc;
	"Public Key": PublicKey;
	"KoLmafia ASH": KoLmafiaASH;
} & Dictionary<Language | undefined>;

export { by_name };
