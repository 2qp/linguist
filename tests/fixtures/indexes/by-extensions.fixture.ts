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

const by_extensions: ByExtensions = {
	".bsl": [_1c_enterprise],
	".2da": [_2_dimensional_array],
	".asc": [ags_script, asciidoc, public_key],
	".ash": [ags_script, kolmafia_ash],
	".aidl": [aidl],
	".apib": [api_blueprint],
} as const;

type ByExtensions = {
	".bsl": readonly [_1CEnterprise];
	".2da": readonly [_2DimensionalArray];
	".asc": readonly [AGSScript, AsciiDoc, PublicKey];
	".ash": readonly [AGSScript, KoLmafiaASH];
	".aidl": readonly [AIDL];
	".apib": readonly [APIBlueprint];
} & Dictionary<readonly Language[] | undefined>;

export { by_extensions };
