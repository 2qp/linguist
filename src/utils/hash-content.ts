import { createHash } from "node:crypto";

import type { BinaryLike } from "node:crypto";

const hashContent = (content: BinaryLike): string => createHash("sha256").update(content).digest("hex");

export { hashContent };
