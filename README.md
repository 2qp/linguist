# linguist-map

[Linguist's `languages.yml`][linguist] language data.

- preprocessed into files, maps, and indexes
- fast lookups by id, name, and extension
- typed data, maps, and type safe getters

## Install

```sh
pnpm add linguist-map
```

```sh
npm install linguist-map
```

## Usages

```ts
import { typescript } from "linguist-map/languages/programming/typescript";

const name = typescript.color;
//	   ^
// "#3178c6"
```

```ts
import { all } from "linguist-map/flat/all";

const extensions = all["TypeScript"].extensions;
//		  ^
// readonly [".ts", ".cts", ".mts"]
```

```ts
import { normalized_all } from "linguist-map/flat/normalized-all";

const id = normalized_all.typescript.language_id;
//	   ^
// 378
```

```ts
import { by_extension } from "linguist-map/indexes/by-extension";
import { getOne } from "linguist-map/getters";

const result = getOne(by_extension, ".ts");
const aliases = result[0].codemirror_mime_type;
//       ^
// "application/typescript"
```

#### Types

```ts
import type { Extensions, Language } from "linguist-map";
import type { TypeScript } from "linguist-map/languages/programming/typescript";

const sample: Language = {};
// ERROR
// Type '{}' is missing the following properties


const ts: TypeScript = {};
// ERROR
// Type '{}' is missing the following properties



const extension: Extensions = [".php", ".lisp"];
```

```ts
import type { Extensions, ExtensionsRelax } from "linguist-map";

const extensions: Extensions = [".dockerfile", "unknown"];
//                                                 ^
// Type '"unknown"' is not assignable to type '".ts" | ".cts" ...


const extensionsRelax: ExtensionsRelax = [".dockerfile", "unknown"];
```
## Getters

#### Get One

```ts

import { by_extension } from "linguist-map/indexes/by-extension";
import { getOne } from "linguist-map/getters";

// const extension = ".ts" as const; // or
const result = getOne(by_extension, ".ts"); // [{ readonly ace_mode: "typescript"; readonly aliases: readonly ["ts"];

const searchKey: string = ".jsx";
const lookupResult = getOne(by_extension, searchKey); // Language[] | undefined

```

| Parameter    | Type                                 | Description                                                                 |
| :----------- | :----------------------------------- | :-------------------------------------------------------------------------- |
| `registry`   | `Record<string, unknown>`            | **Required**. The source registry (e.g., byExtension) used for the lookup. |
| `key`        | `keyof typeof registry` , `string`   | **Required**. The unique identifier (extension or ID) used to retrieve the value. |


#### Get Many

```ts
import { by_extension } from "linguist-map/indexes/by-extension";
import { getMany } from "linguist-map/getters";

const result = getMany(by_extension, [".lua", ".json"]); // [[{ readonly ace_mode: "lua"; readonly codemirror_mime_type: "text/x-lua";

const extensionQueries: string[] = [".dart", ".py"];
const lookupResult = getMany(by_extension, extensionQueries, false); // (Language[] | undefined)[] | undefined

```

| Parameter    | Type                                 | Description                                                                                       |
| :----------- | :----------------------------------- | :------------------------------------------------------------------------------------------------ |
| `registry`   | `Record<string, unknown>`            | **Required**. The source registry                                                                 |
| `key`        | `(keyof typeof registry)[]` , `string[]` | **Required**. The unique identifiers                                                            |
| `strict`     | `boolean`                            | **Optional**. If `true`, restricts input to strict literal types; if `false`, allows a general `string[]`. |


#### Get Lazy One

```ts
import { lazy_by_id } from "linguist-map/indexes/lazy-by-id";
import { getLazyOne } from "linguist-map/getters";

const result = await getLazyOne(lazy_by_id, "327"); // { readonly ace_mode: "rust"; readonly aliases: readonly ["rs"];

const searchKey: string = "326";
const lookupResult = await getLazyOne(lazy_by_id, searchKey); // Language | undefined

```

| Parameter    | Type                                 | Description                                                                                       |
| :----------- | :----------------------------------- | :------------------------------------------------------------------------------------------------ |
| `registry`   | `Record<string, () => Promise<T>>`   | **Required**. The dynamic / lazy source registry (e.g., lazyByExtension, lazyById) used for the lookup. |
| `key`        | `keyof typeof registry` , `string`   | **Required**. The unique identifier (extension or ID) used to retrieve the value.                 |


#### Get Lazy Many

```ts
import { by_extension } from "linguist-map/indexes/by-extension";
import { getLazyMany } from "linguist-map/getters";

const result = await getLazyMany(by_extension, [".c++", ".groovy", ".yaml", ".cs"]);
//      ^
// readonly [[{ readonly ace_mode: "c_cpp"; readonly aliases: readonly ["cpp"]; [...], [...], [...]]


const extensionQueries: string[] = [".env", ".swift"];
const lookupResult = await getLazyMany(by_extension, extensionQueries, false); // (Language[] | undefined)[] | undefined

```

| Parameter    | Type                                       | Description                                                                                       |
| :----------- | :----------------------------------------- | :------------------------------------------------------------------------------------------------ |
| `registry`   | `Record<string, () => Promise<T>>`         | **Required**. The dynamic / lazy source registry (e.g., lazyByExtension, lazyById) used for the lookup. |
| `key`        | `(keyof typeof registry)[]` , `string[]`   | **Required**. The unique identifiers.                                                             |
| `strict`     | `boolean`                                  | **Optional**. If `true`, restricts input to strict literal types; if `false`, allows a general `string[]`. |


## Predicates

#### Is extension of type

```ts
import { isExtensionOfType } from "linguist-map/predicates";

const result = isExtensionOfType(".ts", "markup");
//      ^
// result: false

const extension: string = ".js";
const lookupResult = isExtensionOfType(extension, "prose"); // boolean

```

| Parameter    | Type                               | Description                                                                                       |
| :----------- | :--------------------------------- | :------------------------------------------------------------------------------------------------ |
| `extension`  | `Extensions[number]`               | **Required**. extension (e.g., `.go`, `.yml`) used for the lookup.                                |
| `type`       | `keyof typeof extension` , `string` | **Required**. type (category, e.g., `data`, `markup`, `programming`, `prose`) of target extension. |


## Data

### Categories

| File          | Variable     | Type                                 | Description                     | Example                                                |
| :------------ | :----------- | :----------------------------------- | :------------------------------ | :----------------------------------------------------- |
| `data.ts`     | `data`       | `Record<LanguageName, Language>`     | Languages of `data` category    | `{ "2-Dimensional Array": _2dimensional_array, … }`  |
| `markup.ts`   | `markup`     | `Record<LanguageName, Language>`     | Languages of `markup` category  | `{ "API Blueprint": api_blueprint, … }`              |
| `programming.ts` | `programming` | `Record<LanguageName, Language>`     | Languages of `programming` category | `{ "1C Enterprise": _1c_enterprise, … }`          |
| `prose.ts`    | `prose`      | `Record<LanguageName, Language>`     | Languages of `prose` category   | `{ "AsciiDoc": asciidoc, … }`                        |


### Flat

| File                | Variable                         | Type                         | Description               | Example                                                                 |
| :------------------ | :------------------------------- | :--------------------------- | :------------------------ | :---------------------------------------------------------------------- |
| `all.ts`            | `all`                            | `Record<LanguageName, Language>` | All the languages         | `{ "1C Enterprise": { ace_mode: "text", … }, … } as const`            |
| `normalized-all.ts` | `normalized_all`                 | `Record<string, Language>`   | All the languages         | `{ _1c_enterprise: { ace_mode: "text", … }, … } as const`            |
| `languages.ts`      | `_1c_enterprise`, `_4d`          | `Language`                   | All the `Language` objects | `export const _1c_enterprise, export const _2dimensional_array`         |


### Indexes


| File                      | Variable               | Type                                     | Description           | Example                                                                 |
| :------------------------ | :--------------------- | :--------------------------------------- | :-------------------- | :---------------------------------------------------------------------- |
| `by-type.ts` | `by_type` | `Record<Type, Language[]>` | type to name | `{ "programming": [ _1c_enterprise, _4d, … ], "data": [ _2_dimensional_array, abnf, … ], … } as const` |
| `lazy-by-type.ts` | `lazy_by_type` | `Record<Type, () => Promise<Language[]>>` | type to name | `{ "programming": () => Promise.all([ import('…/1c-enterprise').then(({ _1c_enterprise }) => _1…, "data": () => Promise.all([ import('…/2-dimensional-array').then(({ _2_dimensional_ar…, … } as const` |
| `by-color.ts` | `by_color` | `Record<Color, Language[]>` | color to name | `{ "#814CCC": [ _1c_enterprise ], "#38761D": [ _2_dimensional_array ], … } as const` |
| `lazy-by-color.ts` | `lazy_by_color` | `Record<Color, () => Promise<Language[]>>` | color to name | `{ "#814CCC": () => Promise.all([ import('…/1c-enterprise').then(({ _1c_enterprise }) => _1…, "#38761D": () => Promise.all([ import('…/2-dimensional-array').then(({ _2_dimensional_ar…, … } as const` |
| `by-extensions.ts` | `by_extensions` | `Record<Extensions[number], Language[]>` | extensions to name | `{ ".bsl": [ _1c_enterprise ], ".os": [ _1c_enterprise ], … } as const` |
| `lazy-by-extensions.ts` | `lazy_by_extensions` | `Record<Extensions[number], () => Promise<Language[]>>` | extensions to name | `{ ".bsl": () => Promise.all([ import('…/1c-enterprise').then(({ _1c_enterprise }) => _1…, ".os": () => Promise.all([ import('…/1c-enterprise').then(({ _1c_enterprise }) => _1…, … } as const` |
| `by-tm-scope.ts` | `by_tm_scope` | `Record<TmScope, Language[]>` | tm_scope to name | `{ "source.bsl": [ _1c_enterprise ], "source.2da": [ _2_dimensional_array ], … } as const` |
| `lazy-by-tm-scope.ts` | `lazy_by_tm_scope` | `Record<TmScope, () => Promise<Language[]>>` | tm_scope to name | `{ "source.bsl": () => Promise.all([ import('…/1c-enterprise').then(({ _1c_enterprise }) => _1…, "source.2da": () => Promise.all([ import('…/2-dimensional-array').then(({ _2_dimensional_ar…, … } as const` |
| `by-ace-mode.ts` | `by_ace_mode` | `Record<AceMode, Language[]>` | ace_mode to name | `{ "text": [ _1c_enterprise, _2_dimensional_array, … ], "abap": [ abap ], … } as const` |
| `lazy-by-ace-mode.ts` | `lazy_by_ace_mode` | `Record<AceMode, () => Promise<Language[]>>` | ace_mode to name | `{ "text": () => Promise.all([ import('…/1c-enterprise').then(({ _1c_enterprise }) => _1…, "abap": () => Promise.all([ import('…/abap').then(({ abap }) => abap) ]), … } as const` |
| `by-language-id.ts` | `by_language_id` | `Record<LanguageId, Language>` | language_id to name | `{ 0: _1c_enterprise, 1: abap, … } as const` |
| `lazy-by-language-id.ts` | `lazy_by_language_id` | `Record<LanguageId, () => Promise<Language>>` | language_id to name | `{ 0: () => import('…/1c-enterprise').then(({ _1c_enterprise }) => _1c_enterprise), 1: () => import('…/abap').then(({ abap }) => abap), … } as const` |
| `by-name.ts` | `by_name` | `Record<LanguageName, Language>` | name to name | `{ "1C Enterprise": _1c_enterprise, "2-Dimensional Array": _2_dimensional_array, … } as const` |
| `lazy-by-name.ts` | `lazy_by_name` | `Record<LanguageName, () => Promise<Language>>` | name to name | `{ "1C Enterprise": () => import('…/1c-enterprise').then(({ _1c_enterprise }) => _1c_enterprise), "2-Dimensional Array": () => import('…/2-dimensional-array').then(({ _2_dimensional_array }) => _2_d…, … } as const` |
| `by-aliases.ts` | `by_aliases` | `Record<Aliases[number], Language[]>` | aliases to name | `{ "ags": [ ags_script ], "aspx": [ asp_net ], … } as const` |
| `lazy-by-aliases.ts` | `lazy_by_aliases` | `Record<Aliases[number], () => Promise<Language[]>>` | aliases to name | `{ "ags": () => Promise.all([ import('…/ags-script').then(({ ags_script }) => ags_scrip…, "aspx": () => Promise.all([ import('…/asp-net').then(({ asp_net }) => asp_net) ]), … } as const` |
| `by-codemirror-mode.ts` | `by_codemirror_mode` | `Record<CodemirrorMode, Language[]>` | codemirror_mode to name | `{ "clike": [ ags_script, angelscript, … ], "pascal": [ algol, component_pascal, … ], … } as const` |
| `lazy-by-codemirror-mode.ts` | `lazy_by_codemirror_mode` | `Record<CodemirrorMode, () => Promise<Language[]>>` | codemirror_mode to name | `{ "clike": () => Promise.all([ import('…/ags-script').then(({ ags_script }) => ags_scrip…, "pascal": () => Promise.all([ import('…/algol').then(({ algol }) => algol), import('…/c…, … } as const` |
| `by-codemirror-mime-type.ts` | `by_codemirror_mime_type` | `Record<CodemirrorMimeType, Language[]>` | codemirror_mime_type to name | `{ "text/x-c++src": [ ags_script, angelscript, … ], "text/x-pascal": [ algol, component_pascal, … ], … } as const` |
| `lazy-by-codemirror-mime-type.ts` | `lazy_by_codemirror_mime_type` | `Record<CodemirrorMimeType, () => Promise<Language[]>>` | codemirror_mime_type to name | `{ "text/x-c++src": () => Promise.all([ import('…/ags-script').then(({ ags_script }) => ags_scrip…, "text/x-pascal": () => Promise.all([ import('…/algol').then(({ algol }) => algol), import('…/c…, … } as const` |
| `by-interpreters.ts` | `by_interpreters` | `Record<Interpreters[number], Language[]>` | interpreters to name | `{ "aidl": [ aidl ], "apl": [ apl ], … } as const` |
| `lazy-by-interpreters.ts` | `lazy_by_interpreters` | `Record<Interpreters[number], () => Promise<Language[]>>` | interpreters to name | `{ "aidl": () => Promise.all([ import('…/aidl').then(({ aidl }) => aidl) ]), "apl": () => Promise.all([ import('…/apl').then(({ apl }) => apl) ]), … } as const` |
| `by-group.ts` | `by_group` | `Record<Group, Language[]>` | group to name | `{ "Shell": [ alpine_abuild, gentoo_ebuild, … ], "Assembly": [ apollo_guidance_computer, motorola_68k_assembly, … ], … } as const` |
| `lazy-by-group.ts` | `lazy_by_group` | `Record<Group, () => Promise<Language[]>>` | group to name | `{ "Shell": () => Promise.all([ import('…/alpine-abuild').then(({ alpine_abuild }) => alp…, "Assembly": () => Promise.all([ import('…/apollo-guidance-computer').then(({ apollo_guida…, … } as const` |
| `by-filenames.ts` | `by_filenames` | `Record<Filenames[number], Language[]>` | filenames to name | `{ "APKBUILD": [ alpine_abuild ], "ant.xml": [ ant_build_system ], … } as const` |
| `lazy-by-filenames.ts` | `lazy_by_filenames` | `Record<Filenames[number], () => Promise<Language[]>>` | filenames to name | `{ "APKBUILD": () => Promise.all([ import('…/alpine-abuild').then(({ alpine_abuild }) => alp…, "ant.xml": () => Promise.all([ import('…/ant-build-system').then(({ ant_build_system }) …, … } as const` |
| `by-wrap.ts` | `by_wrap` | `Record<Wrap, Language[]>` | wrap to name | `{ "true": [ asciidoc, cooklang, … ] } as const` |
| `lazy-by-wrap.ts` | `lazy_by_wrap` | `Record<Wrap, () => Promise<Language[]>>` | wrap to name | `{ "true": () => Promise.all([ import('…/asciidoc').then(({ asciidoc }) => asciidoc), im… } as const` |
| `by-fs-name.ts` | `by_fs_name` | `Record<FsName, Language[]>` | fs_name to name | `{ "Fstar": [ fstar ] } as const` |
| `lazy-by-fs-name.ts` | `lazy_by_fs_name` | `Record<FsName, () => Promise<Language[]>>` | fs_name to name | `{ "Fstar": () => Promise.all([ import('…/f-star').then(({ fstar }) => fstar) ]) } as const` |
| `by-searchable.ts` | `by_searchable` | `Record<Searchable, Language[]>` | searchable to name | `{ "false": [ gemfile_lock ] } as const` |
| `lazy-by-searchable.ts` | `lazy_by_searchable` | `Record<Searchable, () => Promise<Language[]>>` | searchable to name | `{ "false": () => Promise.all([ import('…/gemfile-lock').then(({ gemfile_lock }) => gemfi… } as const` |



### Manifest

| File             | Variable      | Type                                                                 | Description                | Example                                                                          |
| :--------------- | :------------ | :------------------------------------------------------------------- | :------------------------  | :------------------------------------------------------------------------------- |
| `extensions.ts`  | `extensions`  | `Record<Extensions, LanguageName[]>`                                 | All the languages          | `{ ".rs": ["RenderScript", "Rust", "XML"], … }`                                 |
| `filenames`      | `filenames`   | `Record<Filenames, LanguageName[]>`                                  | All the `Language` objects | `{ "Jenkinsfile": ["Groovy"], … }`                                              |
| `interpreters`   | `interpreters`| `Record<Interpreters, LanguageName[]>`                               | All the `Language` objects | `{ "deno": ["TypeScript"], … }`                                                 |
| `languages`      | `languages`   | `Record<LanguageName, { id: LanguageId; name: LanguageName }>`       | All the `Language` objects | `{ "Elixir": { id: 100, name: "Elixir" }, … }`                                  |


### Maps


| File                      | Variable               | Type                                     | Description           | Example                                                                 |
| :------------------------ | :--------------------- | :--------------------------------------- | :-------------------- | :---------------------------------------------------------------------- |
| `type-to-color.ts` | `type_to_color` | `Record<Type, ColorWithType>` | type to color | `{ "data": [ "#38761D", "#800000", … ], "markup": [ "#2ACCA8", "#ff269e", … ], … } as const` |
| `type-to-extensions.ts` | `type_to_extensions` | `Record<Type, ExtensionsWithType>` | type to extensions | `{ "data": [ ".2da", ".abnf", … ], "markup": [ ".apib", ".antlers.html", … ], … } as const` |
| `type-to-tm-scope.ts` | `type_to_tm_scope` | `Record<Type, TmScopeWithType>` | type to tm_scope | `{ "data": [ "source.2da", "source.abnf", … ], "markup": [ "text.html.markdown.source.gfm.apib", "text.html.statamic", … ], … } as const` |
| `type-to-ace-mode.ts` | `type_to_ace_mode` | `Record<Type, AceModeWithType>` | type to ace_mode | `{ "data": [ "text", "ini", … ], "markup": [ "markdown", "text", … ], … } as const` |
| `type-to-language-id.ts` | `type_to_language_id` | `Record<Type, LanguageIdWithType>` | type to language_id | `{ "data": [ 387204628, 429, … ], "markup": [ 5, 1067292663, … ], … } as const` |
| `type-to-name.ts` | `type_to_name` | `Record<Type, NameWithType>` | type to name | `{ "data": [ "2-Dimensional Array", "ABNF", … ], "markup": [ "API Blueprint", "Antlers", … ], … } as const` |
| `type-to-aliases.ts` | `type_to_aliases` | `Record<Type, AliasesWithType>` | type to aliases | `{ "data": [ "ad block filters", "ad block", … ], "markup": [ "soy", "d2lang", … ], … } as const` |
| `type-to-codemirror-mode.ts` | `type_to_codemirror_mode` | `Record<Type, CodemirrorModeWithType>` | type to codemirror_mode | `{ "data": [ "asn.1", "xml", … ], "markup": [ "jsx", "stex", … ], … } as const` |
| `type-to-codemirror-mime-type.ts` | `type_to_codemirror_mime_type` | `Record<Type, CodemirrorMimeTypeWithType>` | type to codemirror_mime_type | `{ "data": [ "text/x-ttcn-asn", "application/xml", … ], "markup": [ "text/jsx", "text/x-stex", … ], … } as const` |
| `type-to-interpreters.ts` | `type_to_interpreters` | `Record<Type, InterpretersWithType>` | type to interpreters | `{ "data": [ "gn", "gerbv", … ], "markup": [  ], … } as const` |
| `type-to-group.ts` | `type_to_group` | `Record<Type, GroupWithType>` | type to group | `{ "data": [ "INI", "Python", … ], "markup": [ "TeX", "HTML", … ], … } as const` |
| `type-to-filenames.ts` | `type_to_filenames` | `Record<Type, FilenamesWithType>` | type to filenames | `{ "data": [ "ant.xml", "build.xml", … ], "markup": [ "_helpers.tpl", "Notebook", … ], … } as const` |
| `type-to-wrap.ts` | `type_to_wrap` | `Record<Type, WrapWithType>` | type to wrap | `{ "data": [ true ], "markup": [ true ], … } as const` |
| `type-to-fs-name.ts` | `type_to_fs_name` | `Record<Type, FsNameWithType>` | type to fs_name | `{ "data": [  ], "markup": [  ], … } as const` |
| `type-to-searchable.ts` | `type_to_searchable` | `Record<Type, SearchableWithType>` | type to searchable | `{ "data": [ false ], "markup": [  ], … } as const` |
| `color-to-type.ts` | `color_to_type` | `Record<Color, TypeWithColor>` | color to type | `{ "#000000": [ "data" ], "#00004c": [ "programming" ], … } as const` |
| `color-to-extensions.ts` | `color_to_extensions` | `Record<Color, ExtensionsWithColor>` | color to extensions | `{ "#000000": [ ".gitignore" ], "#00004c": [ ".t" ], … } as const` |
| `color-to-tm-scope.ts` | `color_to_tm_scope` | `Record<Color, TmScopeWithColor>` | color to tm_scope | `{ "#000000": [ "source.gitignore" ], "#00004c": [ "source.terra" ], … } as const` |
| `color-to-ace-mode.ts` | `color_to_ace_mode` | `Record<Color, AceModeWithColor>` | color to ace_mode | `{ "#000000": [ "gitignore" ], "#00004c": [ "lua" ], … } as const` |
| `color-to-language-id.ts` | `color_to_language_id` | `Record<Color, LanguageIdWithColor>` | color to language_id | `{ "#000000": [ 74444240 ], "#00004c": [ 371 ], … } as const` |
| `color-to-name.ts` | `color_to_name` | `Record<Color, NameWithColor>` | color to name | `{ "#000000": [ "Ignore List" ], "#00004c": [ "Terra" ], … } as const` |
| `color-to-aliases.ts` | `color_to_aliases` | `Record<Color, AliasesWithColor>` | color to aliases | `{ "#000000": [ "ignore", "gitignore", … ], "#00004c": [  ], … } as const` |
| `color-to-codemirror-mode.ts` | `color_to_codemirror_mode` | `Record<Color, CodemirrorModeWithColor>` | color to codemirror_mode | `{ "#000000": [ "shell" ], "#00004c": [ "lua" ], … } as const` |
| `color-to-codemirror-mime-type.ts` | `color_to_codemirror_mime_type` | `Record<Color, CodemirrorMimeTypeWithColor>` | color to codemirror_mime_type | `{ "#000000": [ "text/x-sh" ], "#00004c": [ "text/x-lua" ], … } as const` |
| `color-to-interpreters.ts` | `color_to_interpreters` | `Record<Color, InterpretersWithColor>` | color to interpreters | `{ "#000000": [  ], "#00004c": [ "lua" ], … } as const` |
| `color-to-group.ts` | `color_to_group` | `Record<Color, GroupWithColor>` | color to group | `{ "#000000": [  ], "#00004c": [  ], … } as const` |
| `color-to-filenames.ts` | `color_to_filenames` | `Record<Color, FilenamesWithColor>` | color to filenames | `{ "#000000": [ ".atomignore", ".babelignore", … ], "#00004c": [  ], … } as const` |
| `color-to-wrap.ts` | `color_to_wrap` | `Record<Color, WrapWithColor>` | color to wrap | `{ "#000000": [  ], "#00004c": [  ], … } as const` |
| `color-to-fs-name.ts` | `color_to_fs_name` | `Record<Color, FsNameWithColor>` | color to fs_name | `{ "#000000": [  ], "#00004c": [  ], … } as const` |
| `color-to-searchable.ts` | `color_to_searchable` | `Record<Color, SearchableWithColor>` | color to searchable | `{ "#000000": [  ], "#00004c": [  ], … } as const` |
| `extensions-to-type.ts` | `extensions_to_type` | `Record<Extensions[number], TypeWithExtensions>` | extensions to type | `{ ".1": [ "markup" ], ".1in": [ "markup" ], … } as const` |
| `extensions-to-color.ts` | `extensions_to_color` | `Record<Extensions[number], ColorWithExtensions>` | extensions to color | `{ ".1": [ "#ecdebe" ], ".1in": [ "#ecdebe" ], … } as const` |
| `extensions-to-tm-scope.ts` | `extensions_to_tm_scope` | `Record<Extensions[number], TmScopeWithExtensions>` | extensions to tm_scope | `{ ".1": [ "text.roff" ], ".1in": [ "text.roff" ], … } as const` |
| `extensions-to-ace-mode.ts` | `extensions_to_ace_mode` | `Record<Extensions[number], AceModeWithExtensions>` | extensions to ace_mode | `{ ".1": [ "text" ], ".1in": [ "text" ], … } as const` |
| `extensions-to-language-id.ts` | `extensions_to_language_id` | `Record<Extensions[number], LanguageIdWithExtensions>` | extensions to language_id | `{ ".1": [ 141, 612669833 ], ".1in": [ 141, 612669833 ], … } as const` |
| `extensions-to-name.ts` | `extensions_to_name` | `Record<Extensions[number], NameWithExtensions>` | extensions to name | `{ ".1": [ "Roff", "Roff Manpage" ], ".1in": [ "Roff", "Roff Manpage" ], … } as const` |
| `extensions-to-aliases.ts` | `extensions_to_aliases` | `Record<Extensions[number], AliasesWithExtensions>` | extensions to aliases | `{ ".1": [ "groff", "man", … ], ".1in": [ "groff", "man", … ], … } as const` |
| `extensions-to-codemirror-mode.ts` | `extensions_to_codemirror_mode` | `Record<Extensions[number], CodemirrorModeWithExtensions>` | extensions to codemirror_mode | `{ ".1": [ "troff" ], ".1in": [ "troff" ], … } as const` |
| `extensions-to-codemirror-mime-type.ts` | `extensions_to_codemirror_mime_type` | `Record<Extensions[number], CodemirrorMimeTypeWithExtensions>` | extensions to codemirror_mime_type | `{ ".1": [ "text/troff" ], ".1in": [ "text/troff" ], … } as const` |
| `extensions-to-interpreters.ts` | `extensions_to_interpreters` | `Record<Extensions[number], InterpretersWithExtensions>` | extensions to interpreters | `{ ".1": [  ], ".1in": [  ], … } as const` |
| `extensions-to-group.ts` | `extensions_to_group` | `Record<Extensions[number], GroupWithExtensions>` | extensions to group | `{ ".1": [ "Roff" ], ".1in": [ "Roff" ], … } as const` |
| `extensions-to-filenames.ts` | `extensions_to_filenames` | `Record<Extensions[number], FilenamesWithExtensions>` | extensions to filenames | `{ ".1": [ "eqnrc", "mmn", … ], ".1in": [ "eqnrc", "mmn", … ], … } as const` |
| `extensions-to-wrap.ts` | `extensions_to_wrap` | `Record<Extensions[number], WrapWithExtensions>` | extensions to wrap | `{ ".1": [ true ], ".1in": [ true ], … } as const` |
| `extensions-to-fs-name.ts` | `extensions_to_fs_name` | `Record<Extensions[number], FsNameWithExtensions>` | extensions to fs_name | `{ ".1": [  ], ".1in": [  ], … } as const` |
| `extensions-to-searchable.ts` | `extensions_to_searchable` | `Record<Extensions[number], SearchableWithExtensions>` | extensions to searchable | `{ ".1": [  ], ".1in": [  ], … } as const` |
| `tm-scope-to-type.ts` | `tm_scope_to_type` | `Record<TmScope, TypeWithTmScope>` | tm_scope to type | `{ "config.xcompose": [ "data" ], "file.lasso": [ "programming" ], … } as const` |
| `tm-scope-to-color.ts` | `tm_scope_to_color` | `Record<TmScope, ColorWithTmScope>` | tm_scope to color | `{ "config.xcompose": [  ], "file.lasso": [ "#999999" ], … } as const` |
| `tm-scope-to-extensions.ts` | `tm_scope_to_extensions` | `Record<TmScope, ExtensionsWithTmScope>` | tm_scope to extensions | `{ "config.xcompose": [  ], "file.lasso": [ ".lasso", ".las", … ], … } as const` |
| `tm-scope-to-ace-mode.ts` | `tm_scope_to_ace_mode` | `Record<TmScope, AceModeWithTmScope>` | tm_scope to ace_mode | `{ "config.xcompose": [ "text" ], "file.lasso": [ "text" ], … } as const` |
| `tm-scope-to-language-id.ts` | `tm_scope_to_language_id` | `Record<TmScope, LanguageIdWithTmScope>` | tm_scope to language_id | `{ "config.xcompose": [ 225167241 ], "file.lasso": [ 195 ], … } as const` |
| `tm-scope-to-name.ts` | `tm_scope_to_name` | `Record<TmScope, NameWithTmScope>` | tm_scope to name | `{ "config.xcompose": [ "XCompose" ], "file.lasso": [ "Lasso" ], … } as const` |
| `tm-scope-to-aliases.ts` | `tm_scope_to_aliases` | `Record<TmScope, AliasesWithTmScope>` | tm_scope to aliases | `{ "config.xcompose": [  ], "file.lasso": [ "lassoscript" ], … } as const` |
| `tm-scope-to-codemirror-mode.ts` | `tm_scope_to_codemirror_mode` | `Record<TmScope, CodemirrorModeWithTmScope>` | tm_scope to codemirror_mode | `{ "config.xcompose": [  ], "file.lasso": [  ], … } as const` |
| `tm-scope-to-codemirror-mime-type.ts` | `tm_scope_to_codemirror_mime_type` | `Record<TmScope, CodemirrorMimeTypeWithTmScope>` | tm_scope to codemirror_mime_type | `{ "config.xcompose": [  ], "file.lasso": [  ], … } as const` |
| `tm-scope-to-interpreters.ts` | `tm_scope_to_interpreters` | `Record<TmScope, InterpretersWithTmScope>` | tm_scope to interpreters | `{ "config.xcompose": [  ], "file.lasso": [  ], … } as const` |
| `tm-scope-to-group.ts` | `tm_scope_to_group` | `Record<TmScope, GroupWithTmScope>` | tm_scope to group | `{ "config.xcompose": [  ], "file.lasso": [  ], … } as const` |
| `tm-scope-to-filenames.ts` | `tm_scope_to_filenames` | `Record<TmScope, FilenamesWithTmScope>` | tm_scope to filenames | `{ "config.xcompose": [ ".XCompose", "XCompose", … ], "file.lasso": [  ], … } as const` |
| `tm-scope-to-wrap.ts` | `tm_scope_to_wrap` | `Record<TmScope, WrapWithTmScope>` | tm_scope to wrap | `{ "config.xcompose": [  ], "file.lasso": [  ], … } as const` |
| `tm-scope-to-fs-name.ts` | `tm_scope_to_fs_name` | `Record<TmScope, FsNameWithTmScope>` | tm_scope to fs_name | `{ "config.xcompose": [  ], "file.lasso": [  ], … } as const` |
| `tm-scope-to-searchable.ts` | `tm_scope_to_searchable` | `Record<TmScope, SearchableWithTmScope>` | tm_scope to searchable | `{ "config.xcompose": [  ], "file.lasso": [  ], … } as const` |
| `ace-mode-to-type.ts` | `ace_mode_to_type` | `Record<AceMode, TypeWithAceMode>` | ace_mode to type | `{ "abap": [ "programming" ], "actionscript": [ "programming" ], … } as const` |
| `ace-mode-to-color.ts` | `ace_mode_to_color` | `Record<AceMode, ColorWithAceMode>` | ace_mode to color | `{ "abap": [ "#E8274B" ], "actionscript": [ "#882B0F" ], … } as const` |
| `ace-mode-to-extensions.ts` | `ace_mode_to_extensions` | `Record<AceMode, ExtensionsWithAceMode>` | ace_mode to extensions | `{ "abap": [ ".abap" ], "actionscript": [ ".as" ], … } as const` |
| `ace-mode-to-tm-scope.ts` | `ace_mode_to_tm_scope` | `Record<AceMode, TmScopeWithAceMode>` | ace_mode to tm_scope | `{ "abap": [ "source.abap" ], "actionscript": [ "source.actionscript.3" ], … } as const` |
| `ace-mode-to-language-id.ts` | `ace_mode_to_language_id` | `Record<AceMode, LanguageIdWithAceMode>` | ace_mode to language_id | `{ "abap": [ 1 ], "actionscript": [ 10 ], … } as const` |
| `ace-mode-to-name.ts` | `ace_mode_to_name` | `Record<AceMode, NameWithAceMode>` | ace_mode to name | `{ "abap": [ "ABAP" ], "actionscript": [ "ActionScript" ], … } as const` |
| `ace-mode-to-aliases.ts` | `ace_mode_to_aliases` | `Record<AceMode, AliasesWithAceMode>` | ace_mode to aliases | `{ "abap": [  ], "actionscript": [ "actionscript 3", "actionscript3", … ], … } as const` |
| `ace-mode-to-codemirror-mode.ts` | `ace_mode_to_codemirror_mode` | `Record<AceMode, CodemirrorModeWithAceMode>` | ace_mode to codemirror_mode | `{ "abap": [  ], "actionscript": [  ], … } as const` |
| `ace-mode-to-codemirror-mime-type.ts` | `ace_mode_to_codemirror_mime_type` | `Record<AceMode, CodemirrorMimeTypeWithAceMode>` | ace_mode to codemirror_mime_type | `{ "abap": [  ], "actionscript": [  ], … } as const` |
| `ace-mode-to-interpreters.ts` | `ace_mode_to_interpreters` | `Record<AceMode, InterpretersWithAceMode>` | ace_mode to interpreters | `{ "abap": [  ], "actionscript": [  ], … } as const` |
| `ace-mode-to-group.ts` | `ace_mode_to_group` | `Record<AceMode, GroupWithAceMode>` | ace_mode to group | `{ "abap": [  ], "actionscript": [  ], … } as const` |
| `ace-mode-to-filenames.ts` | `ace_mode_to_filenames` | `Record<AceMode, FilenamesWithAceMode>` | ace_mode to filenames | `{ "abap": [  ], "actionscript": [  ], … } as const` |
| `ace-mode-to-wrap.ts` | `ace_mode_to_wrap` | `Record<AceMode, WrapWithAceMode>` | ace_mode to wrap | `{ "abap": [  ], "actionscript": [  ], … } as const` |
| `ace-mode-to-fs-name.ts` | `ace_mode_to_fs_name` | `Record<AceMode, FsNameWithAceMode>` | ace_mode to fs_name | `{ "abap": [  ], "actionscript": [  ], … } as const` |
| `ace-mode-to-searchable.ts` | `ace_mode_to_searchable` | `Record<AceMode, SearchableWithAceMode>` | ace_mode to searchable | `{ "abap": [  ], "actionscript": [  ], … } as const` |
| `language-id-to-type.ts` | `language_id_to_type` | `Record<LanguageId, LanguageIdWithType>` | language_id to type | `{ 0: "programming", 1: "programming", … } as const` |
| `language-id-to-color.ts` | `language_id_to_color` | `Record<LanguageId, LanguageIdWithColor>` | language_id to color | `{ 0: "#814CCC", 1: "#E8274B", … } as const` |
| `language-id-to-extensions.ts` | `language_id_to_extensions` | `Record<LanguageId, LanguageIdWithExtensions>` | language_id to extensions | `{ 0: [ ".bsl", ".os" ], 1: [ ".abap" ], … } as const` |
| `language-id-to-tm-scope.ts` | `language_id_to_tm_scope` | `Record<LanguageId, LanguageIdWithTmScope>` | language_id to tm_scope | `{ 0: "source.bsl", 1: "source.abap", … } as const` |
| `language-id-to-ace-mode.ts` | `language_id_to_ace_mode` | `Record<LanguageId, LanguageIdWithAceMode>` | language_id to ace_mode | `{ 0: "text", 1: "abap", … } as const` |
| `language-id-to-name.ts` | `language_id_to_name` | `Record<LanguageId, LanguageIdWithName>` | language_id to name | `{ 0: "1C Enterprise", 1: "ABAP", … } as const` |
| `language-id-to-aliases.ts` | `language_id_to_aliases` | `Record<LanguageId, LanguageIdWithAliases>` | language_id to aliases | `{ 2: [ "ags" ], 8: [ "asp" ], … } as const` |
| `language-id-to-codemirror-mode.ts` | `language_id_to_codemirror_mode` | `Record<LanguageId, LanguageIdWithCodemirrorMode>` | language_id to codemirror_mode | `{ 2: "clike", 6: "apl", … } as const` |
| `language-id-to-codemirror-mime-type.ts` | `language_id_to_codemirror_mime_type` | `Record<LanguageId, LanguageIdWithCodemirrorMimeType>` | language_id to codemirror_mime_type | `{ 2: "text/x-c++src", 6: "text/apl", … } as const` |
| `language-id-to-interpreters.ts` | `language_id_to_interpreters` | `Record<LanguageId, LanguageIdWithInterpreters>` | language_id to interpreters | `{ 6: [ "apl", "aplx", … ], 19: [ "osascript" ], … } as const` |
| `language-id-to-group.ts` | `language_id_to_group` | `Record<LanguageId, LanguageIdWithGroup>` | language_id to group | `{ 14: "Shell", 18: "Assembly", … } as const` |
| `language-id-to-filenames.ts` | `language_id_to_filenames` | `Record<LanguageId, LanguageIdWithFilenames>` | language_id to filenames | `{ 14: [ "APKBUILD" ], 15: [ "ant.xml", "build.xml" ], … } as const` |
| `language-id-to-wrap.ts` | `language_id_to_wrap` | `Record<LanguageId, LanguageIdWithWrap>` | language_id to wrap | `{ 22: true, 71: true, … } as const` |
| `language-id-to-fs-name.ts` | `language_id_to_fs_name` | `Record<LanguageId, LanguageIdWithFsName>` | language_id to fs_name | `{ 336943375: "Fstar" } as const` |
| `language-id-to-searchable.ts` | `language_id_to_searchable` | `Record<LanguageId, LanguageIdWithSearchable>` | language_id to searchable | `{ 907065713: false } as const` |
| `name-to-type.ts` | `name_to_type` | `Record<LanguageName, NameWithType>` | name to type | `{ "1C Enterprise": "programming", "2-Dimensional Array": "data", … } as const` |
| `name-to-color.ts` | `name_to_color` | `Record<LanguageName, NameWithColor>` | name to color | `{ "1C Enterprise": "#814CCC", "2-Dimensional Array": "#38761D", … } as const` |
| `name-to-extensions.ts` | `name_to_extensions` | `Record<LanguageName, NameWithExtensions>` | name to extensions | `{ "1C Enterprise": [ ".bsl", ".os" ], "2-Dimensional Array": [ ".2da" ], … } as const` |
| `name-to-tm-scope.ts` | `name_to_tm_scope` | `Record<LanguageName, NameWithTmScope>` | name to tm_scope | `{ "1C Enterprise": "source.bsl", "2-Dimensional Array": "source.2da", … } as const` |
| `name-to-ace-mode.ts` | `name_to_ace_mode` | `Record<LanguageName, NameWithAceMode>` | name to ace_mode | `{ "1C Enterprise": "text", "2-Dimensional Array": "text", … } as const` |
| `name-to-language-id.ts` | `name_to_language_id` | `Record<LanguageName, NameWithLanguageId>` | name to language_id | `{ "1C Enterprise": 0, "2-Dimensional Array": 387204628, … } as const` |
| `name-to-aliases.ts` | `name_to_aliases` | `Record<LanguageName, NameWithAliases>` | name to aliases | `{ "AGS Script": [ "ags" ], "ASP.NET": [ "aspx", "aspx-vb" ], … } as const` |
| `name-to-codemirror-mode.ts` | `name_to_codemirror_mode` | `Record<LanguageName, NameWithCodemirrorMode>` | name to codemirror_mode | `{ "AGS Script": "clike", "ALGOL": "pascal", … } as const` |
| `name-to-codemirror-mime-type.ts` | `name_to_codemirror_mime_type` | `Record<LanguageName, NameWithCodemirrorMimeType>` | name to codemirror_mime_type | `{ "AGS Script": "text/x-c++src", "ALGOL": "text/x-pascal", … } as const` |
| `name-to-interpreters.ts` | `name_to_interpreters` | `Record<LanguageName, NameWithInterpreters>` | name to interpreters | `{ "AIDL": [ "aidl" ], "APL": [ "apl", "aplx", … ], … } as const` |
| `name-to-group.ts` | `name_to_group` | `Record<LanguageName, NameWithGroup>` | name to group | `{ "Alpine Abuild": "Shell", "Apollo Guidance Computer": "Assembly", … } as const` |
| `name-to-filenames.ts` | `name_to_filenames` | `Record<LanguageName, NameWithFilenames>` | name to filenames | `{ "Alpine Abuild": [ "APKBUILD" ], "Ant Build System": [ "ant.xml", "build.xml" ], … } as const` |
| `name-to-wrap.ts` | `name_to_wrap` | `Record<LanguageName, NameWithWrap>` | name to wrap | `{ "AsciiDoc": true, "Cooklang": true, … } as const` |
| `name-to-fs-name.ts` | `name_to_fs_name` | `Record<LanguageName, NameWithFsName>` | name to fs_name | `{ "F*": "Fstar" } as const` |
| `name-to-searchable.ts` | `name_to_searchable` | `Record<LanguageName, NameWithSearchable>` | name to searchable | `{ "Gemfile.lock": false } as const` |
| `aliases-to-type.ts` | `aliases_to_type` | `Record<Aliases[number], TypeWithAliases>` | aliases to type | `{ "AFDKO": [ "data" ], "AutoIt3": [ "programming" ], … } as const` |
| `aliases-to-color.ts` | `aliases_to_color` | `Record<Aliases[number], ColorWithAliases>` | aliases to color | `{ "AFDKO": [  ], "AutoIt3": [ "#1C3552" ], … } as const` |
| `aliases-to-extensions.ts` | `aliases_to_extensions` | `Record<Aliases[number], ExtensionsWithAliases>` | aliases to extensions | `{ "AFDKO": [ ".fea" ], "AutoIt3": [ ".au3" ], … } as const` |
| `aliases-to-tm-scope.ts` | `aliases_to_tm_scope` | `Record<Aliases[number], TmScopeWithAliases>` | aliases to tm_scope | `{ "AFDKO": [ "source.opentype" ], "AutoIt3": [ "source.autoit" ], … } as const` |
| `aliases-to-ace-mode.ts` | `aliases_to_ace_mode` | `Record<Aliases[number], AceModeWithAliases>` | aliases to ace_mode | `{ "AFDKO": [ "text" ], "AutoIt3": [ "autohotkey" ], … } as const` |
| `aliases-to-language-id.ts` | `aliases_to_language_id` | `Record<Aliases[number], LanguageIdWithAliases>` | aliases to language_id | `{ "AFDKO": [ 374317347 ], "AutoIt3": [ 27 ], … } as const` |
| `aliases-to-name.ts` | `aliases_to_name` | `Record<Aliases[number], NameWithAliases>` | aliases to name | `{ "AFDKO": [ "OpenType Feature File" ], "AutoIt3": [ "AutoIt" ], … } as const` |
| `aliases-to-codemirror-mode.ts` | `aliases_to_codemirror_mode` | `Record<Aliases[number], CodemirrorModeWithAliases>` | aliases to codemirror_mode | `{ "AFDKO": [  ], "AutoIt3": [  ], … } as const` |
| `aliases-to-codemirror-mime-type.ts` | `aliases_to_codemirror_mime_type` | `Record<Aliases[number], CodemirrorMimeTypeWithAliases>` | aliases to codemirror_mime_type | `{ "AFDKO": [  ], "AutoIt3": [  ], … } as const` |
| `aliases-to-interpreters.ts` | `aliases_to_interpreters` | `Record<Aliases[number], InterpretersWithAliases>` | aliases to interpreters | `{ "AFDKO": [  ], "AutoIt3": [  ], … } as const` |
| `aliases-to-group.ts` | `aliases_to_group` | `Record<Aliases[number], GroupWithAliases>` | aliases to group | `{ "AFDKO": [  ], "AutoIt3": [  ], … } as const` |
| `aliases-to-filenames.ts` | `aliases_to_filenames` | `Record<Aliases[number], FilenamesWithAliases>` | aliases to filenames | `{ "AFDKO": [  ], "AutoIt3": [  ], … } as const` |
| `aliases-to-wrap.ts` | `aliases_to_wrap` | `Record<Aliases[number], WrapWithAliases>` | aliases to wrap | `{ "AFDKO": [  ], "AutoIt3": [  ], … } as const` |
| `aliases-to-fs-name.ts` | `aliases_to_fs_name` | `Record<Aliases[number], FsNameWithAliases>` | aliases to fs_name | `{ "AFDKO": [  ], "AutoIt3": [  ], … } as const` |
| `aliases-to-searchable.ts` | `aliases_to_searchable` | `Record<Aliases[number], SearchableWithAliases>` | aliases to searchable | `{ "AFDKO": [  ], "AutoIt3": [  ], … } as const` |
| `codemirror-mode-to-type.ts` | `codemirror_mode_to_type` | `Record<CodemirrorMode, TypeWithCodemirrorMode>` | codemirror_mode to type | `{ "apl": [ "programming" ], "asciiarmor": [ "data" ], … } as const` |
| `codemirror-mode-to-color.ts` | `codemirror_mode_to_color` | `Record<CodemirrorMode, ColorWithCodemirrorMode>` | codemirror_mode to color | `{ "apl": [ "#5A8164" ], "asciiarmor": [  ], … } as const` |
| `codemirror-mode-to-extensions.ts` | `codemirror_mode_to_extensions` | `Record<CodemirrorMode, ExtensionsWithCodemirrorMode>` | codemirror_mode to extensions | `{ "apl": [ ".apl", ".dyalog" ], "asciiarmor": [ ".asc", ".pub" ], … } as const` |
| `codemirror-mode-to-tm-scope.ts` | `codemirror_mode_to_tm_scope` | `Record<CodemirrorMode, TmScopeWithCodemirrorMode>` | codemirror_mode to tm_scope | `{ "apl": [ "source.apl" ], "asciiarmor": [ "none" ], … } as const` |
| `codemirror-mode-to-ace-mode.ts` | `codemirror_mode_to_ace_mode` | `Record<CodemirrorMode, AceModeWithCodemirrorMode>` | codemirror_mode to ace_mode | `{ "apl": [ "text" ], "asciiarmor": [ "text" ], … } as const` |
| `codemirror-mode-to-language-id.ts` | `codemirror_mode_to_language_id` | `Record<CodemirrorMode, LanguageIdWithCodemirrorMode>` | codemirror_mode to language_id | `{ "apl": [ 6 ], "asciiarmor": [ 298 ], … } as const` |
| `codemirror-mode-to-name.ts` | `codemirror_mode_to_name` | `Record<CodemirrorMode, NameWithCodemirrorMode>` | codemirror_mode to name | `{ "apl": [ "APL" ], "asciiarmor": [ "Public Key" ], … } as const` |
| `codemirror-mode-to-aliases.ts` | `codemirror_mode_to_aliases` | `Record<CodemirrorMode, AliasesWithCodemirrorMode>` | codemirror_mode to aliases | `{ "apl": [  ], "asciiarmor": [  ], … } as const` |
| `codemirror-mode-to-codemirror-mime-type.ts` | `codemirror_mode_to_codemirror_mime_type` | `Record<CodemirrorMode, CodemirrorMimeTypeWithCodemirrorMode>` | codemirror_mode to codemirror_mime_type | `{ "apl": [ "text/apl" ], "asciiarmor": [ "application/pgp" ], … } as const` |
| `codemirror-mode-to-interpreters.ts` | `codemirror_mode_to_interpreters` | `Record<CodemirrorMode, InterpretersWithCodemirrorMode>` | codemirror_mode to interpreters | `{ "apl": [ "apl", "aplx", … ], "asciiarmor": [  ], … } as const` |
| `codemirror-mode-to-group.ts` | `codemirror_mode_to_group` | `Record<CodemirrorMode, GroupWithCodemirrorMode>` | codemirror_mode to group | `{ "apl": [  ], "asciiarmor": [  ], … } as const` |
| `codemirror-mode-to-filenames.ts` | `codemirror_mode_to_filenames` | `Record<CodemirrorMode, FilenamesWithCodemirrorMode>` | codemirror_mode to filenames | `{ "apl": [  ], "asciiarmor": [  ], … } as const` |
| `codemirror-mode-to-wrap.ts` | `codemirror_mode_to_wrap` | `Record<CodemirrorMode, WrapWithCodemirrorMode>` | codemirror_mode to wrap | `{ "apl": [  ], "asciiarmor": [  ], … } as const` |
| `codemirror-mode-to-fs-name.ts` | `codemirror_mode_to_fs_name` | `Record<CodemirrorMode, FsNameWithCodemirrorMode>` | codemirror_mode to fs_name | `{ "apl": [  ], "asciiarmor": [  ], … } as const` |
| `codemirror-mode-to-searchable.ts` | `codemirror_mode_to_searchable` | `Record<CodemirrorMode, SearchableWithCodemirrorMode>` | codemirror_mode to searchable | `{ "apl": [  ], "asciiarmor": [  ], … } as const` |
| `codemirror-mime-type-to-type.ts` | `codemirror_mime_type_to_type` | `Record<CodemirrorMimeType, TypeWithCodemirrorMimeType>` | codemirror_mime_type to type | `{ "application/dart": [ "programming" ], "application/edn": [ "data" ], … } as const` |
| `codemirror-mime-type-to-color.ts` | `codemirror_mime_type_to_color` | `Record<CodemirrorMimeType, ColorWithCodemirrorMimeType>` | codemirror_mime_type to color | `{ "application/dart": [ "#00B4AB" ], "application/edn": [  ], … } as const` |
| `codemirror-mime-type-to-extensions.ts` | `codemirror_mime_type_to_extensions` | `Record<CodemirrorMimeType, ExtensionsWithCodemirrorMimeType>` | codemirror_mime_type to extensions | `{ "application/dart": [ ".dart" ], "application/edn": [ ".edn" ], … } as const` |
| `codemirror-mime-type-to-tm-scope.ts` | `codemirror_mime_type_to_tm_scope` | `Record<CodemirrorMimeType, TmScopeWithCodemirrorMimeType>` | codemirror_mime_type to tm_scope | `{ "application/dart": [ "source.dart" ], "application/edn": [ "source.clojure" ], … } as const` |
| `codemirror-mime-type-to-ace-mode.ts` | `codemirror_mime_type_to_ace_mode` | `Record<CodemirrorMimeType, AceModeWithCodemirrorMimeType>` | codemirror_mime_type to ace_mode | `{ "application/dart": [ "dart" ], "application/edn": [ "clojure" ], … } as const` |
| `codemirror-mime-type-to-language-id.ts` | `codemirror_mime_type_to_language_id` | `Record<CodemirrorMimeType, LanguageIdWithCodemirrorMimeType>` | codemirror_mime_type to language_id | `{ "application/dart": [ 87 ], "application/edn": [ 414 ], … } as const` |
| `codemirror-mime-type-to-name.ts` | `codemirror_mime_type_to_name` | `Record<CodemirrorMimeType, NameWithCodemirrorMimeType>` | codemirror_mime_type to name | `{ "application/dart": [ "Dart" ], "application/edn": [ "edn" ], … } as const` |
| `codemirror-mime-type-to-aliases.ts` | `codemirror_mime_type_to_aliases` | `Record<CodemirrorMimeType, AliasesWithCodemirrorMimeType>` | codemirror_mime_type to aliases | `{ "application/dart": [  ], "application/edn": [  ], … } as const` |
| `codemirror-mime-type-to-codemirror-mode.ts` | `codemirror_mime_type_to_codemirror_mode` | `Record<CodemirrorMimeType, CodemirrorModeWithCodemirrorMimeType>` | codemirror_mime_type to codemirror_mode | `{ "application/dart": [ "dart" ], "application/edn": [ "clojure" ], … } as const` |
| `codemirror-mime-type-to-interpreters.ts` | `codemirror_mime_type_to_interpreters` | `Record<CodemirrorMimeType, InterpretersWithCodemirrorMimeType>` | codemirror_mime_type to interpreters | `{ "application/dart": [ "dart" ], "application/edn": [  ], … } as const` |
| `codemirror-mime-type-to-group.ts` | `codemirror_mime_type_to_group` | `Record<CodemirrorMimeType, GroupWithCodemirrorMimeType>` | codemirror_mime_type to group | `{ "application/dart": [  ], "application/edn": [  ], … } as const` |
| `codemirror-mime-type-to-filenames.ts` | `codemirror_mime_type_to_filenames` | `Record<CodemirrorMimeType, FilenamesWithCodemirrorMimeType>` | codemirror_mime_type to filenames | `{ "application/dart": [  ], "application/edn": [  ], … } as const` |
| `codemirror-mime-type-to-wrap.ts` | `codemirror_mime_type_to_wrap` | `Record<CodemirrorMimeType, WrapWithCodemirrorMimeType>` | codemirror_mime_type to wrap | `{ "application/dart": [  ], "application/edn": [  ], … } as const` |
| `codemirror-mime-type-to-fs-name.ts` | `codemirror_mime_type_to_fs_name` | `Record<CodemirrorMimeType, FsNameWithCodemirrorMimeType>` | codemirror_mime_type to fs_name | `{ "application/dart": [  ], "application/edn": [  ], … } as const` |
| `codemirror-mime-type-to-searchable.ts` | `codemirror_mime_type_to_searchable` | `Record<CodemirrorMimeType, SearchableWithCodemirrorMimeType>` | codemirror_mime_type to searchable | `{ "application/dart": [  ], "application/edn": [  ], … } as const` |
| `interpreters-to-type.ts` | `interpreters_to_type` | `Record<Interpreters[number], TypeWithInterpreters>` | interpreters to type | `{ "M2": [ "programming" ], "MathKernel": [ "programming" ], … } as const` |
| `interpreters-to-color.ts` | `interpreters_to_color` | `Record<Interpreters[number], ColorWithInterpreters>` | interpreters to color | `{ "M2": [ "#d8ffff" ], "MathKernel": [ "#dd1100" ], … } as const` |
| `interpreters-to-extensions.ts` | `interpreters_to_extensions` | `Record<Interpreters[number], ExtensionsWithInterpreters>` | interpreters to extensions | `{ "M2": [ ".m2" ], "MathKernel": [ ".mathematica", ".cdf", … ], … } as const` |
| `interpreters-to-tm-scope.ts` | `interpreters_to_tm_scope` | `Record<Interpreters[number], TmScopeWithInterpreters>` | interpreters to tm_scope | `{ "M2": [ "source.m2" ], "MathKernel": [ "source.mathematica" ], … } as const` |
| `interpreters-to-ace-mode.ts` | `interpreters_to_ace_mode` | `Record<Interpreters[number], AceModeWithInterpreters>` | interpreters to ace_mode | `{ "M2": [ "text" ], "MathKernel": [ "text" ], … } as const` |
| `interpreters-to-language-id.ts` | `interpreters_to_language_id` | `Record<Interpreters[number], LanguageIdWithInterpreters>` | interpreters to language_id | `{ "M2": [ 34167825 ], "MathKernel": [ 224 ], … } as const` |
| `interpreters-to-name.ts` | `interpreters_to_name` | `Record<Interpreters[number], NameWithInterpreters>` | interpreters to name | `{ "M2": [ "Macaulay2" ], "MathKernel": [ "Wolfram Language" ], … } as const` |
| `interpreters-to-aliases.ts` | `interpreters_to_aliases` | `Record<Interpreters[number], AliasesWithInterpreters>` | interpreters to aliases | `{ "M2": [ "m2" ], "MathKernel": [ "mathematica", "mma", … ], … } as const` |
| `interpreters-to-codemirror-mode.ts` | `interpreters_to_codemirror_mode` | `Record<Interpreters[number], CodemirrorModeWithInterpreters>` | interpreters to codemirror_mode | `{ "M2": [  ], "MathKernel": [ "mathematica" ], … } as const` |
| `interpreters-to-codemirror-mime-type.ts` | `interpreters_to_codemirror_mime_type` | `Record<Interpreters[number], CodemirrorMimeTypeWithInterpreters>` | interpreters to codemirror_mime_type | `{ "M2": [  ], "MathKernel": [ "text/x-mathematica" ], … } as const` |
| `interpreters-to-group.ts` | `interpreters_to_group` | `Record<Interpreters[number], GroupWithInterpreters>` | interpreters to group | `{ "M2": [  ], "MathKernel": [  ], … } as const` |
| `interpreters-to-filenames.ts` | `interpreters_to_filenames` | `Record<Interpreters[number], FilenamesWithInterpreters>` | interpreters to filenames | `{ "M2": [  ], "MathKernel": [  ], … } as const` |
| `interpreters-to-wrap.ts` | `interpreters_to_wrap` | `Record<Interpreters[number], WrapWithInterpreters>` | interpreters to wrap | `{ "M2": [  ], "MathKernel": [  ], … } as const` |
| `interpreters-to-fs-name.ts` | `interpreters_to_fs_name` | `Record<Interpreters[number], FsNameWithInterpreters>` | interpreters to fs_name | `{ "M2": [  ], "MathKernel": [  ], … } as const` |
| `interpreters-to-searchable.ts` | `interpreters_to_searchable` | `Record<Interpreters[number], SearchableWithInterpreters>` | interpreters to searchable | `{ "M2": [  ], "MathKernel": [  ], … } as const` |
| `group-to-type.ts` | `group_to_type` | `Record<Group, TypeWithGroup>` | group to type | `{ "Agda": [ "programming" ], "Assembly": [ "programming" ], … } as const` |
| `group-to-color.ts` | `group_to_color` | `Record<Group, ColorWithGroup>` | group to color | `{ "Agda": [ "#315665" ], "Assembly": [ "#0B3D91", "#005daa" ], … } as const` |
| `group-to-extensions.ts` | `group_to_extensions` | `Record<Group, ExtensionsWithGroup>` | group to extensions | `{ "Agda": [ ".lagda" ], "Assembly": [ ".agc", ".asm", … ], … } as const` |
| `group-to-tm-scope.ts` | `group_to_tm_scope` | `Record<Group, TmScopeWithGroup>` | group to tm_scope | `{ "Agda": [ "none" ], "Assembly": [ "source.agc", "source.m68k", … ], … } as const` |
| `group-to-ace-mode.ts` | `group_to_ace_mode` | `Record<Group, AceModeWithGroup>` | group to ace_mode | `{ "Agda": [ "text" ], "Assembly": [ "assembly_x86" ], … } as const` |
| `group-to-language-id.ts` | `group_to_language_id` | `Record<Group, LanguageIdWithGroup>` | group to language_id | `{ "Agda": [ 205 ], "Assembly": [ 18, 477582706, … ], … } as const` |
| `group-to-name.ts` | `group_to_name` | `Record<Group, NameWithGroup>` | group to name | `{ "Agda": [ "Literate Agda" ], "Assembly": [ "Apollo Guidance Computer", "Motorola 68K Assembly", … ], … } as const` |
| `group-to-aliases.ts` | `group_to_aliases` | `Record<Group, AliasesWithGroup>` | group to aliases | `{ "Agda": [  ], "Assembly": [ "m68k", "gas", … ], … } as const` |
| `group-to-codemirror-mode.ts` | `group_to_codemirror_mode` | `Record<Group, CodemirrorModeWithGroup>` | group to codemirror_mode | `{ "Agda": [  ], "Assembly": [  ], … } as const` |
| `group-to-codemirror-mime-type.ts` | `group_to_codemirror_mime_type` | `Record<Group, CodemirrorMimeTypeWithGroup>` | group to codemirror_mime_type | `{ "Agda": [  ], "Assembly": [  ], … } as const` |
| `group-to-interpreters.ts` | `group_to_interpreters` | `Record<Group, InterpretersWithGroup>` | group to interpreters | `{ "Agda": [  ], "Assembly": [  ], … } as const` |
| `group-to-filenames.ts` | `group_to_filenames` | `Record<Group, FilenamesWithGroup>` | group to filenames | `{ "Agda": [  ], "Assembly": [  ], … } as const` |
| `group-to-wrap.ts` | `group_to_wrap` | `Record<Group, WrapWithGroup>` | group to wrap | `{ "Agda": [  ], "Assembly": [  ], … } as const` |
| `group-to-fs-name.ts` | `group_to_fs_name` | `Record<Group, FsNameWithGroup>` | group to fs_name | `{ "Agda": [  ], "Assembly": [  ], … } as const` |
| `group-to-searchable.ts` | `group_to_searchable` | `Record<Group, SearchableWithGroup>` | group to searchable | `{ "Agda": [  ], "Assembly": [  ], … } as const` |
| `filenames-to-type.ts` | `filenames_to_type` | `Record<Filenames[number], TypeWithFilenames>` | filenames to type | `{ ".JUSTFILE": [ "programming" ], ".Justfile": [ "programming" ], … } as const` |
| `filenames-to-color.ts` | `filenames_to_color` | `Record<Filenames[number], ColorWithFilenames>` | filenames to color | `{ ".JUSTFILE": [ "#384d54" ], ".Justfile": [ "#384d54" ], … } as const` |
| `filenames-to-extensions.ts` | `filenames_to_extensions` | `Record<Filenames[number], ExtensionsWithFilenames>` | filenames to extensions | `{ ".JUSTFILE": [ ".just" ], ".Justfile": [ ".just" ], … } as const` |
| `filenames-to-tm-scope.ts` | `filenames_to_tm_scope` | `Record<Filenames[number], TmScopeWithFilenames>` | filenames to tm_scope | `{ ".JUSTFILE": [ "source.just" ], ".Justfile": [ "source.just" ], … } as const` |
| `filenames-to-ace-mode.ts` | `filenames_to_ace_mode` | `Record<Filenames[number], AceModeWithFilenames>` | filenames to ace_mode | `{ ".JUSTFILE": [ "text" ], ".Justfile": [ "text" ], … } as const` |
| `filenames-to-language-id.ts` | `filenames_to_language_id` | `Record<Filenames[number], LanguageIdWithFilenames>` | filenames to language_id | `{ ".JUSTFILE": [ 128447695 ], ".Justfile": [ 128447695 ], … } as const` |
| `filenames-to-name.ts` | `filenames_to_name` | `Record<Filenames[number], NameWithFilenames>` | filenames to name | `{ ".JUSTFILE": [ "Just" ], ".Justfile": [ "Just" ], … } as const` |
| `filenames-to-aliases.ts` | `filenames_to_aliases` | `Record<Filenames[number], AliasesWithFilenames>` | filenames to aliases | `{ ".JUSTFILE": [ "Justfile" ], ".Justfile": [ "Justfile" ], … } as const` |
| `filenames-to-codemirror-mode.ts` | `filenames_to_codemirror_mode` | `Record<Filenames[number], CodemirrorModeWithFilenames>` | filenames to codemirror_mode | `{ ".JUSTFILE": [  ], ".Justfile": [  ], … } as const` |
| `filenames-to-codemirror-mime-type.ts` | `filenames_to_codemirror_mime_type` | `Record<Filenames[number], CodemirrorMimeTypeWithFilenames>` | filenames to codemirror_mime_type | `{ ".JUSTFILE": [  ], ".Justfile": [  ], … } as const` |
| `filenames-to-interpreters.ts` | `filenames_to_interpreters` | `Record<Filenames[number], InterpretersWithFilenames>` | filenames to interpreters | `{ ".JUSTFILE": [  ], ".Justfile": [  ], … } as const` |
| `filenames-to-group.ts` | `filenames_to_group` | `Record<Filenames[number], GroupWithFilenames>` | filenames to group | `{ ".JUSTFILE": [  ], ".Justfile": [  ], … } as const` |
| `filenames-to-wrap.ts` | `filenames_to_wrap` | `Record<Filenames[number], WrapWithFilenames>` | filenames to wrap | `{ ".JUSTFILE": [  ], ".Justfile": [  ], … } as const` |
| `filenames-to-fs-name.ts` | `filenames_to_fs_name` | `Record<Filenames[number], FsNameWithFilenames>` | filenames to fs_name | `{ ".JUSTFILE": [  ], ".Justfile": [  ], … } as const` |
| `filenames-to-searchable.ts` | `filenames_to_searchable` | `Record<Filenames[number], SearchableWithFilenames>` | filenames to searchable | `{ ".JUSTFILE": [  ], ".Justfile": [  ], … } as const` |
| `wrap-to-type.ts` | `wrap_to_type` | `Record<Wrap, TypeWithWrap>` | wrap to type | `{ "true": [ "prose", "markup", … ] } as const` |
| `wrap-to-color.ts` | `wrap_to_color` | `Record<Wrap, ColorWithWrap>` | wrap to color | `{ "true": [ "#73a0c5", "#E15A29", … ] } as const` |
| `wrap-to-extensions.ts` | `wrap_to_extensions` | `Record<Wrap, ExtensionsWithWrap>` | wrap to extensions | `{ "true": [ ".asciidoc", ".adoc", … ] } as const` |
| `wrap-to-tm-scope.ts` | `wrap_to_tm_scope` | `Record<Wrap, TmScopeWithWrap>` | wrap to tm_scope | `{ "true": [ "text.html.asciidoc", "source.cooklang", … ] } as const` |
| `wrap-to-ace-mode.ts` | `wrap_to_ace_mode` | `Record<Wrap, AceModeWithWrap>` | wrap to ace_mode | `{ "true": [ "asciidoc", "text", … ] } as const` |
| `wrap-to-language-id.ts` | `wrap_to_language_id` | `Record<Wrap, LanguageIdWithWrap>` | wrap to language_id | `{ "true": [ 22, 788037493, … ] } as const` |
| `wrap-to-name.ts` | `wrap_to_name` | `Record<Wrap, NameWithWrap>` | wrap to name | `{ "true": [ "AsciiDoc", "Cooklang", … ] } as const` |
| `wrap-to-aliases.ts` | `wrap_to_aliases` | `Record<Wrap, AliasesWithWrap>` | wrap to aliases | `{ "true": [ "gemtext", "commit", … ] } as const` |
| `wrap-to-codemirror-mode.ts` | `wrap_to_codemirror_mode` | `Record<Wrap, CodemirrorModeWithWrap>` | wrap to codemirror_mode | `{ "true": [ "gfm", "perl", … ] } as const` |
| `wrap-to-codemirror-mime-type.ts` | `wrap_to_codemirror_mime_type` | `Record<Wrap, CodemirrorMimeTypeWithWrap>` | wrap to codemirror_mime_type | `{ "true": [ "text/x-gfm", "text/x-perl", … ] } as const` |
| `wrap-to-interpreters.ts` | `wrap_to_interpreters` | `Record<Wrap, InterpretersWithWrap>` | wrap to interpreters | `{ "true": [ "perl", "perl6", … ] } as const` |
| `wrap-to-group.ts` | `wrap_to_group` | `Record<Wrap, GroupWithWrap>` | wrap to group | `{ "true": [ "CoffeeScript", "Roff" ] } as const` |
| `wrap-to-filenames.ts` | `wrap_to_filenames` | `Record<Wrap, FilenamesWithWrap>` | wrap to filenames | `{ "true": [ "COMMIT_EDITMSG", "contents.lr", … ] } as const` |
| `wrap-to-fs-name.ts` | `wrap_to_fs_name` | `Record<Wrap, FsNameWithWrap>` | wrap to fs_name | `{ "true": [  ] } as const` |
| `wrap-to-searchable.ts` | `wrap_to_searchable` | `Record<Wrap, SearchableWithWrap>` | wrap to searchable | `{ "true": [  ] } as const` |
| `fs-name-to-type.ts` | `fs_name_to_type` | `Record<FsName, TypeWithFsName>` | fs_name to type | `{ "Fstar": [ "programming" ] } as const` |
| `fs-name-to-color.ts` | `fs_name_to_color` | `Record<FsName, ColorWithFsName>` | fs_name to color | `{ "Fstar": [ "#572e30" ] } as const` |
| `fs-name-to-extensions.ts` | `fs_name_to_extensions` | `Record<FsName, ExtensionsWithFsName>` | fs_name to extensions | `{ "Fstar": [ ".fst", ".fsti" ] } as const` |
| `fs-name-to-tm-scope.ts` | `fs_name_to_tm_scope` | `Record<FsName, TmScopeWithFsName>` | fs_name to tm_scope | `{ "Fstar": [ "source.fstar" ] } as const` |
| `fs-name-to-ace-mode.ts` | `fs_name_to_ace_mode` | `Record<FsName, AceModeWithFsName>` | fs_name to ace_mode | `{ "Fstar": [ "text" ] } as const` |
| `fs-name-to-language-id.ts` | `fs_name_to_language_id` | `Record<FsName, LanguageIdWithFsName>` | fs_name to language_id | `{ "Fstar": [ 336943375 ] } as const` |
| `fs-name-to-name.ts` | `fs_name_to_name` | `Record<FsName, NameWithFsName>` | fs_name to name | `{ "Fstar": [ "F*" ] } as const` |
| `fs-name-to-aliases.ts` | `fs_name_to_aliases` | `Record<FsName, AliasesWithFsName>` | fs_name to aliases | `{ "Fstar": [ "fstar" ] } as const` |
| `fs-name-to-codemirror-mode.ts` | `fs_name_to_codemirror_mode` | `Record<FsName, CodemirrorModeWithFsName>` | fs_name to codemirror_mode | `{ "Fstar": [  ] } as const` |
| `fs-name-to-codemirror-mime-type.ts` | `fs_name_to_codemirror_mime_type` | `Record<FsName, CodemirrorMimeTypeWithFsName>` | fs_name to codemirror_mime_type | `{ "Fstar": [  ] } as const` |
| `fs-name-to-interpreters.ts` | `fs_name_to_interpreters` | `Record<FsName, InterpretersWithFsName>` | fs_name to interpreters | `{ "Fstar": [  ] } as const` |
| `fs-name-to-group.ts` | `fs_name_to_group` | `Record<FsName, GroupWithFsName>` | fs_name to group | `{ "Fstar": [  ] } as const` |
| `fs-name-to-filenames.ts` | `fs_name_to_filenames` | `Record<FsName, FilenamesWithFsName>` | fs_name to filenames | `{ "Fstar": [  ] } as const` |
| `fs-name-to-wrap.ts` | `fs_name_to_wrap` | `Record<FsName, WrapWithFsName>` | fs_name to wrap | `{ "Fstar": [  ] } as const` |
| `fs-name-to-searchable.ts` | `fs_name_to_searchable` | `Record<FsName, SearchableWithFsName>` | fs_name to searchable | `{ "Fstar": [  ] } as const` |
| `searchable-to-type.ts` | `searchable_to_type` | `Record<Searchable, TypeWithSearchable>` | searchable to type | `{ "false": [ "data" ] } as const` |
| `searchable-to-color.ts` | `searchable_to_color` | `Record<Searchable, ColorWithSearchable>` | searchable to color | `{ "false": [ "#701516" ] } as const` |
| `searchable-to-extensions.ts` | `searchable_to_extensions` | `Record<Searchable, ExtensionsWithSearchable>` | searchable to extensions | `{ "false": [  ] } as const` |
| `searchable-to-tm-scope.ts` | `searchable_to_tm_scope` | `Record<Searchable, TmScopeWithSearchable>` | searchable to tm_scope | `{ "false": [ "source.gemfile-lock" ] } as const` |
| `searchable-to-ace-mode.ts` | `searchable_to_ace_mode` | `Record<Searchable, AceModeWithSearchable>` | searchable to ace_mode | `{ "false": [ "text" ] } as const` |
| `searchable-to-language-id.ts` | `searchable_to_language_id` | `Record<Searchable, LanguageIdWithSearchable>` | searchable to language_id | `{ "false": [ 907065713 ] } as const` |
| `searchable-to-name.ts` | `searchable_to_name` | `Record<Searchable, NameWithSearchable>` | searchable to name | `{ "false": [ "Gemfile.lock" ] } as const` |
| `searchable-to-aliases.ts` | `searchable_to_aliases` | `Record<Searchable, AliasesWithSearchable>` | searchable to aliases | `{ "false": [  ] } as const` |
| `searchable-to-codemirror-mode.ts` | `searchable_to_codemirror_mode` | `Record<Searchable, CodemirrorModeWithSearchable>` | searchable to codemirror_mode | `{ "false": [  ] } as const` |
| `searchable-to-codemirror-mime-type.ts` | `searchable_to_codemirror_mime_type` | `Record<Searchable, CodemirrorMimeTypeWithSearchable>` | searchable to codemirror_mime_type | `{ "false": [  ] } as const` |
| `searchable-to-interpreters.ts` | `searchable_to_interpreters` | `Record<Searchable, InterpretersWithSearchable>` | searchable to interpreters | `{ "false": [  ] } as const` |
| `searchable-to-group.ts` | `searchable_to_group` | `Record<Searchable, GroupWithSearchable>` | searchable to group | `{ "false": [  ] } as const` |
| `searchable-to-filenames.ts` | `searchable_to_filenames` | `Record<Searchable, FilenamesWithSearchable>` | searchable to filenames | `{ "false": [ "Gemfile.lock" ] } as const` |
| `searchable-to-wrap.ts` | `searchable_to_wrap` | `Record<Searchable, WrapWithSearchable>` | searchable to wrap | `{ "false": [  ] } as const` |
| `searchable-to-fs-name.ts` | `searchable_to_fs_name` | `Record<Searchable, FsNameWithSearchable>` | searchable to fs_name | `{ "false": [  ] } as const` |



### Arrays


| File                            | Variable                                          | Type                                                | Description                      | Example                                                                    |
| :------------------------------ | :------------------------------------------------ | :-------------------------------------------------- | :------------------------------- | :------------------------------------------------------------------------- |
| `all.ts`                        | `all`                                             | `Language[]`                                        | All language objects in an array | `[{"ace_mode":"text", … }, {"ace_mode":"text","color":"#38761D", … }]`     |
| `id-name.ts`                    | `id_name`                                         | `{ name: LanguageName, language_id: LanguageId }[]` | Array of Language name–ID pairs  | `[{"language_id":577529595,"name":"4D"}, {"language_id":1,"name":"ABAP"}, … ]` |
| `ace-mode-array.ts`             | `ace_mode_array`, `ace_mode_array_relax`          | `AceMode[]`, `AceModeRelax[]`                       | Array of Ace editor modes        | `["text", "abap", "c_cpp", "pascal", "markdown" … ]`                       |
| `aliases-array.ts`              | `aliases_array`, `aliases_array_relax`            | `Aliases[]`, `AliasesRelax[]`                       | Array of aliases                 | `["ags", "aspx", "aspx-vb", "ats2", "actionscript 3" … ]`                  |
| `codemirror-mime-type-array.ts` | `codemirror_mime_type_array`, `codemirror_mime_type_array_relax` | `CodemirrorMimeType[]`, `CodemirrorMimeTypeRelax[]` | Array of code mirror mimes        | `["text/x-c++src", "text/x-pascal", "text/apl", … ]`                       |
| `codemirror-mode-array.ts`      | `codemirror_mode_array`, `codemirror_mode_array_relax` | `CodemirrorMode[]`, `CodemirrorModeRelax[]`         | Array of code mirror modes       | `["clike", "pascal", "apl", "asn.1", "htmlembedded", … ]`                  |
| `color-array.ts`                | `color_array`, `color_array_relax`                | `Color[]`, `ColorRelax[]`                           | Array of colors                  | `["#814CCC", "#38761D", "#004289", "#E8274B", … ]`                         |
| `extensions-array.ts`           | `extensions_array`, `extensions_array_relax`      | `Extensions[]`, `ExtensionsRelax[]`                 | Array of extensions              | `[".bsl", ".os", ".2da", ".4dm", ".abap", … ]`                             |
| `filenames-array.ts`            | `filenames_array`, `filenames_array_relax`        | `Filenames[]`, `FilenamesRelax[]`                   | Array of filenames               | `["APKBUILD", "ant.xml", "build.xml", ".htaccess", … ]`                    |
| `fs-name-array.ts`              | `fs_name_array`, `fs_name_array_relax`            | `FsName[]`, `FsNameRelax[]`                         | Array of filesystem names        | `["Fstar", … ]`                                                            |
| `group-array.ts`                | `group_array`, `group_array_relax`                | `Group[]`, `GroupRelax[]`                           | Array of groups                  | `["Shell", "Assembly", "TeX", "Yacc", … ]`                                 |
| `interpreters-array.ts`         | `interpreters_array`, `interpreters_array_relax`  | `Interpreters[]`, `InterpretersRelax[]`             | Array of interpreters            | `["aidl", "apl", "aplx", "dyalog", "clingo", … ]`                          |
| `language-id-array.ts`          | `language_id_array`, `language_id_array_relax`    | `LanguageId[]`, `LanguageIdRelax[]`                 | Array of language IDs            | `[0, 387204628, 577529595, 1, 452681853, 429, … ]`                         |
| `name-array.ts`                 | `name_array`, `name_array_relax`                  | `LanguageName[]`, `LanguageNameRelax[]`             | Array of names                   | `["1C Enterprise", "2-Dimensional Array", "4D", … ]`                       |
| `searchable-array.ts`           | `searchable_array`, `searchable_array_relax`      | `Searchable[]`, `SearchableRelax[]`                 | Array of searchable booleans     | `[false, … ]`                                                              |
| `tm-scope-array.ts`             | `tm_scope_array`, `tm_scope_array_relax`          | `TmScope[]`, `TmScopeRelax[]`                       | Array of TextMate scopes         | `["source.bsl", "source.2da", "source.4dm", … ]`                           |
| `type-array.ts`                 | `type_array`, `type_array_relax`                  | `Type[]`, `TypeRelax[]`                             | Array of types                   | `["programming", "data", "markup", "prose", … ]`                           |
| `wrap-array.ts`                 | `wrap_array`, `wrap_array_relax`                  | `Wrap[]`, `WrapRelax[]`                             | Array of wrap settings           | `[true, … ]`                                                               |


### Languages

| Folder           | Files                         | Variable                    | Type       | Description                     | Example                                                  |
| :--------------- | :---------------------------- | :-------------------------- | :--------- | :------------------------------ | :------------------------------------------------------- |
| `data/`          | `csv.ts`, `prisma.ts`, `…`    | `csv`, `prisma`, `…`        | `Language` | Languages of `data` type        | `const csv = { "ace_mode": "csv", … }`                   |
| `markup/`        | `html.ts`, `blade.ts`, `…`    | `html`, `blade`, `…`        | `Language` | Languages of `markup` type      | `const blade = { "ace_mode": "php_laravel_blade", … }`   |
| `programming/`   | `java.ts`, `matlab.ts`, `…`   | `java`, `matlab`, `…`       | `Language` | Languages of `programming` type | `const java = { "ace_mode": "java", … }`                 |
| `prose/`         | `gemini.ts`, `pod.ts`, `…`    | `gemini`, `pod`, `…`        | `Language` | Languages of `prose` type       | `const gemini = { "aliases": ["gemtext"], … }`           |


## Types

### Language

| Property                | Type                    | Definition                                                                 |
| :---------------------- | :---------------------- | :------------------------------------------------------------------------- |
| ace_mode                | `AceMode`               | `"gcode" \| "gherkin" \| "golang" \| … `                                   |
| aliases?                | `Aliases`               | `["as3" \| "ascii stl" \| "asm" \| … ]`                                    |
| codemirror_mime_type?   | `CodemirrorMimeType`    | `"text/css" \| "text/html" \| "text/javascript" \| … `                     |
| codemirror_mode?        | `CodemirrorMode`        | `"vbscript" \| "velocity" \| "verilog" \| … `                              |
| color?                  | `Color`                 | `"#00bce4" \| "#00c0b5" \| "#00cafe" \| … `                          |
| extensions?             | `Extensions`            | `[".ant" \| ".antlers.html" \| ".antlers.php" \| … ]`                      |
| filenames?              | `Filenames`             | `["_curlrc" \| "_dir_colors" \| "_dircolors" \| … ]`                       |
| fs_name?                | `FsName`                | `"Fstar" \| … `                                                             |
| group?                  | `Group`                 | `"TypeScript" \| "XML" \| "Yacc" \| … `                                    |
| interpreters?           | `Interpreters`          | `["clingo" \| "clisp" \| "csh" \| … ]`                                     |
| language_id             | `LanguageId`            | `120 \| 121 \| 122 \| … `                                                  |
| name                    | `LanguageName`          | `["Vue", "Vyper", "Wavefront Material", … ]`                               |
| searchable?             | `Searchable`            | `false \| … `                                                              |
| tm_scope                | `TmScope`               | `["source.fan", "source.fancy", "source.faust", … ]`                       |
| type                    | `Type`                  | `"data" \| "markup" \| "programming" \| "prose"`                           |
| wrap?                   | `Wrap`                  | `true \| … `                                                               |


> **Note:** Relaxed versions (e.g. `AceModeRelax`, `ExtensionsRelax`, `…` ) also exist and allow any string in addition to the listed values.

> **Note:** Types are also available as filtered/crossed variants (e.g. `AceModeWithAliases`, `NameWithExtensions`, `[x]With[y]` for subsets).


### Misc


| Property | Type             | Definition                         |
| :------- | :--------------- | :--------------------------------- |
| -        | `Languages`      | `Record<LanguageName, Language>`   |
| -        | `LanguageField`  | `keyof Language`                   |


### Utilities


| Property | Type                                                                       | Definition               |
| -------- | -------------------------------------------------------------------------- | ------------------------ |
| —        | `GetLanguage<Name extends LanguageName>`                                   | `Languages[Name]`        |
| —        | `GetLanguageField<Name extends LanguageName, Field extends LanguageField>` | `Languages[Name][Field]` |


[//]: # 

   [linguist]: <https://github.com/github-linguist/linguist/blob/main/lib/linguist/languages.yml>