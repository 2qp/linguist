import { extensions_to_type } from "@/generated/data/maps/extensions-to-type";
import { getOne } from "@/transform/accessors/get-one";

import type { ExtensionsToType } from "@/generated/data/maps/extensions-to-type";
import type { Extensions, Type } from "@/types/generated.types";

// type IsExtensionOfTypeParams = {};

type IsExtensionOfType = {
	<const TExtension extends Extensions[number], const TType extends Type>(
		extension: TExtension,
		type: TType,
	): TType extends ExtensionsToType[TExtension][number] ? true : false;

	<TExtension extends string, TType>(extension: TExtension, type: TType): boolean;
};

const isExtensionOfType: IsExtensionOfType = (extension: string, type: Type) => {
	//

	const result = getOne(extensions_to_type, extension);

	return result.includes(type); // mmm might not need set
};

export { isExtensionOfType };
export type { IsExtensionOfType };
