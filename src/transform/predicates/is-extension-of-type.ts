import { extension_to_type } from "@/generated/data/maps/extension-to-type";
import { getOne } from "@/transform/accessors/get-one";

import type { ExtensionToType } from "@/generated/data/maps/extension-to-type";
import type { Extensions, Type } from "@/types/generated.types";

// type IsExtensionOfTypeParams = {};

type IsExtensionOfType = {
	<const TExtension extends Extensions[number], const TType extends Type>(
		extension: TExtension,
		type: TType,
	): TType extends ExtensionToType[TExtension][number] ? true : false;

	<TExtension extends string, TType>(extension: TExtension, type: TType): boolean;
};

const isExtensionOfType: IsExtensionOfType = (extension: string, type: Type) => {
	//

	const result = getOne(extension_to_type, extension);

	return result.includes(type); // mmm might not need set
};

export { isExtensionOfType };
export type { IsExtensionOfType };
