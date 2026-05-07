import type { _2DimensionalArray } from "../languages/data/2-dimensional-array";
import type { PublicKey } from "../languages/data/public-key";
import type { APIBlueprint } from "../languages/markup/api-blueprint";
import type { _1CEnterprise } from "../languages/programming/1c-enterprise";
import type { AGSScript } from "../languages/programming/ags-script";
import type { AIDL } from "../languages/programming/aidl";
import type { KoLmafiaASH } from "../languages/programming/kolmafia-ash";
import type { AsciiDoc } from "../languages/prose/asciidoc";
import type { Dictionary, Language } from "../types/language-types.generated";

const lazy_by_name: LazyByName = {
	"1C Enterprise": () => import("../languages/programming/1c-enterprise").then(({ _1c_enterprise }) => _1c_enterprise),
	"2-Dimensional Array": () =>
		import("../languages/data/2-dimensional-array").then(({ _2_dimensional_array }) => _2_dimensional_array),
	AIDL: () => import("../languages/programming/aidl").then(({ aidl }) => aidl),
	"AGS Script": () => import("../languages/programming/ags-script").then(({ ags_script }) => ags_script),
	"API Blueprint": () => import("../languages/markup/api-blueprint").then(({ api_blueprint }) => api_blueprint),
	AsciiDoc: () => import("../languages/prose/asciidoc").then(({ asciidoc }) => asciidoc),
	"Public Key": () => import("../languages/data/public-key").then(({ public_key }) => public_key),
	"KoLmafia ASH": () => import("../languages/programming/kolmafia-ash").then(({ kolmafia_ash }) => kolmafia_ash),
} as const;

type LazyByName = {
	"1C Enterprise": () => Promise<_1CEnterprise>;
	"2-Dimensional Array": () => Promise<_2DimensionalArray>;
	"AGS Script": () => Promise<AGSScript>;
	AIDL: () => Promise<AIDL>;
	"API Blueprint": () => Promise<APIBlueprint>;
	AsciiDoc: () => Promise<AsciiDoc>;
	"Public Key": () => Promise<PublicKey>;
	"KoLmafia ASH": () => Promise<KoLmafiaASH>;
} & Dictionary<() => Promise<Language | undefined>>;

export { lazy_by_name };
