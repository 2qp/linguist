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
import { typescript } from "linguist-map/data/languages/programming/typescript";

const name = typescript.color;
//	   ^
// "#3178c6"
```

```ts
import { all } from "linguist-map/data/flat/all";

const extensions = all["TypeScript"].extensions;
//		  ^
// readonly [".ts", ".cts", ".mts"]
```

```ts
import { normalizedAll } from "linguist-map/data/flat/normalized-all";

const id = normalizedAll.typescript.language_id;
//	   ^
// 378
```

```ts
import { byExtension } from "linguist-map/data/indexes/by-extension";
import { getOne } from "linguist-map/getters";

const result = getOne(byExtension, ".ts");
const aliases = result[0].codemirror_mime_type;
//       ^
// "application/typescript"
```

#### Types

```ts
import type { Extensions, Language } from "linguist-map";
import type { TypeScriptType } from "linguist-map/data/languages/programming/typescript";

const sample: Language = {};
// ERROR
// Type '{}' is missing the following properties


const ts: TypeScriptType = {};
// ERROR
// Type '{}' is missing the following properties



const extension: Extensions = [".php", ".lisp"];
```

```ts
import type { Extensions, FlexExtensions } from "linguist-map";

const extensions: Extensions = [".dockerfile", "unknown"];
//                                                 ^
// Type '"unknown"' is not assignable to type '".ts" | ".cts" ...


const extensionsFlex: FlexExtensions = [".dockerfile", "unknown"];
```
## Getters

#### Get One

```ts

import { byExtension } from "linguist-map/data/indexes/by-extension";
import { getOne } from "linguist-map/getters";

// const extension = ".ts" as const; // or
const result = getOne(byExtension, ".ts"); // [{ readonly ace_mode: "typescript"; readonly aliases: readonly ["ts"];

const searchKey: string = ".jsx";
const lookupResult = getOne(byExtension, searchKey); // Language[] | undefined

```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `registry` | `Record<string, unknown>` | **Required**. The source registry (e.g., byExtension) used for the lookup. |
| `key` | `keyof typeof registry` , `string` | **Required**. The unique identifier (extension or ID) used to retrieve the value. |

#### Get Many

```ts
import { byExtension } from "linguist-map/data/indexes/by-extension";
import { getMany } from "linguist-map/getters";

const result = getMany(byExtension, [".lua", ".json"]); // [[{ readonly ace_mode: "lua"; readonly codemirror_mime_type: "text/x-lua";

const extensionQueries: string[] = [".dart", ".py"];
const lookupResult = getMany(byExtension, extensionQueries, false); // (Language[] | undefined)[] | undefined

```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `registry`      | `Record<string, unknown>` | **Required**. The source registry |
| `key`      | `(keyof typeof registry)[]` , `string[]` | **Required**. The unique identifiers |
| `strict`      | `boolean` | **Optional**. If `true`, restricts input to strict literal types; if `false`, allows a general `string[]`.|


#### Get Lazy One

```ts
import { lazyById } from "linguist-map/data/indexes/lazy-by-id";
import { getLazyOne } from "linguist-map/getters";

const result = await getLazyOne(lazyById, "327"); // { readonly ace_mode: "rust"; readonly aliases: readonly ["rs"];

const searchKey: string = "326";
const lookupResult = await getLazyOne(lazyById, searchKey); // Language | undefined

```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `registry` | `Record<string, () => Promise<T>>` | **Required**. The dynamic / lazy source registry (e.g., lazyByExtension, lazyById) used for the lookup. |
| `key` | `keyof typeof registry` , `string` | **Required**. The unique identifier (extension or ID) used to retrieve the value. |

#### Get Lazy Many

```ts
import { byExtension } from "linguist-map/data/esm/indexes/by-extension";
import { getMany } from "linguist-map/getters";

const result = await getLazyMany(lazyByExtension, [".c++", ".groovy", ".yaml", ".cs"]);
//      ^
// readonly [[{ readonly ace_mode: "c_cpp"; readonly aliases: readonly ["cpp"]; [...], [...], [...]]


const extensionQueries: string[] = [".env", ".swift"];
const lookupResult = await getLazyMany(lazyByExtension, extensionQueries, false); // (Language[] | undefined)[] | undefined

```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `registry` | `Record<string, () => Promise<T>>` | **Required**. The dynamic / lazy source registry (e.g., lazyByExtension, lazyById) used for the lookup. |
| `key` | `(keyof typeof registry)[]` , `string[]` | **Required**. The unique identifiers. |
| `strict`| `boolean` | **Optional**. If `true`, restricts input to strict literal types; if `false`, allows a general `string[]`.|



[//]: # 

   [linguist]: <https://github.com/github-linguist/linguist/blob/main/lib/linguist/languages.yml>