import { nodePropertiesFromRef } from "../../../utils.js";
import type { ZodArrayDef } from "zod";
import type { ArrayNode, ParseFunction } from "../../../parseNodeTypes.js";
import { zodSelectorFunction } from "../selector.js";

export const parseZodArrayDef: ParseFunction<ZodArrayDef, ArrayNode> = (
	def,
	refs,
) => {
	const { type } = def;
	const childType = zodSelectorFunction(type._def, { ...refs, path: [] });
	refs.addDataFunctions.addDescriptionIfExists(def, refs);
	return {
		type: "array",
		childType,
		...nodePropertiesFromRef(refs),
	};
};
