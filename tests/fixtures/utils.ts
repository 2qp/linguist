import type { Config } from "@/types/config.types";
import type { DeepPartial } from "@/types/utility.types";

const createPartialConfig = (config: DeepPartial<Config>) => ({ ...config });

export { createPartialConfig };
