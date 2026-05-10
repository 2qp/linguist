import type { _2DimensionalArray } from "../languages/data/2-dimensional-array";
import type { PublicKey } from "../languages/data/public-key";
import type { APIBlueprint } from "../languages/markup/api-blueprint";
import type { _1CEnterprise } from "../languages/programming/1c-enterprise";
import type { AGSScript } from "../languages/programming/ags-script";
import type { AIDL } from "../languages/programming/aidl";
import type { KoLmafiaASH } from "../languages/programming/kolmafia-ash";
import type { AsciiDoc } from "../languages/prose/asciidoc";
import type { Dictionary, Language } from "../types/language-types.generated";

const lazy_by_extensions: LazyByExtensions = {
	".bsl": () =>
		Promise.all([import("../languages/programming/1c-enterprise").then(({ _1c_enterprise }) => _1c_enterprise)]),

	".2da": () =>
		Promise.all([
			import("../languages/data/2-dimensional-array").then(({ _2_dimensional_array }) => _2_dimensional_array),
		]),
	".asc": () =>
		Promise.all([
			import("../languages/programming/ags-script").then(({ ags_script }) => ags_script),
			import("../languages/prose/asciidoc").then(({ asciidoc }) => asciidoc),
			import("../languages/data/public-key").then(({ public_key }) => public_key),
		]),
	".ash": () =>
		Promise.all([
			import("../languages/programming/ags-script").then(({ ags_script }) => ags_script),
			import("../languages/programming/kolmafia-ash").then(({ kolmafia_ash }) => kolmafia_ash),
		]),
	".aidl": () => Promise.all([import("../languages/programming/aidl").then(({ aidl }) => aidl)]),
	".apib": () => Promise.all([import("../languages/markup/api-blueprint").then(({ api_blueprint }) => api_blueprint)]),
} as const;

type LazyByExtensions = {
	".bsl": () => Promise<readonly [_1CEnterprise]>;
	".2da": () => Promise<readonly [_2DimensionalArray]>;
	".asc": () => Promise<readonly [AGSScript, AsciiDoc, PublicKey]>;
	".ash": () => Promise<readonly [AGSScript, KoLmafiaASH]>;
	".aidl": () => Promise<readonly [AIDL]>;
	".apib": () => Promise<readonly [APIBlueprint]>;
} & Dictionary<() => Promise<readonly Language[] | undefined>>;

export { lazy_by_extensions };
