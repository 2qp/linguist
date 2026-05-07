import { IGNORE_WEBPACK } from "../constants/transforms";

import type { Plugin } from "vitest/config";

const cdnMock = (): Plugin => {
	return {
		name: "cdn-mock",
		enforce: "pre",

		resolveId(source) {
			if (source.startsWith(`${IGNORE_WEBPACK}https://cdn.jsdelivr.net/`)) {
				return `\0cdn-mock:${source}`;
			}
		},

		load(id) {
			if (id.startsWith("\0cdn-mock:")) {
				//

				const url = id
					.replace("\0cdn-mock:", "") //
					.replace(IGNORE_WEBPACK, "");

				const start = url.indexOf("/languages");
				const path = start !== -1 ? url.slice(start) : "";

				const params = new URL(url);
				const ctx = params.searchParams.get("ctx");

				return `export { ${ctx} } from '/tests/fixtures${path}.ts';`;
			}
		},
	};
};

export { cdnMock };
