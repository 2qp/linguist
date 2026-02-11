import { isShadowingGlobal } from "@utils/is-shadowing-global";

// type CreateSafeNameParams = {};

type CreateSafeName = (name: string) => string | `_${string}`;

const createSafeName: CreateSafeName = (name) => {
	//

	return isShadowingGlobal(name) ? (`_${name}` as const) : name;
};

export { createSafeName };
export type { CreateSafeName };
