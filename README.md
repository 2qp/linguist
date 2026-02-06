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


[//]: # 

   [linguist]: <https://github.com/github-linguist/linguist/blob/main/lib/linguist/languages.yml>