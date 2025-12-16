import { createHash } from "node:crypto";

const hashContent = (content: string): string => createHash("sha256").update(content).digest("hex");

export { hashContent };
