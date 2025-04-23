import { nodePropertiesFromRef } from "../../../utils.js";
import type { ZodLiteralDef } from "zod";
import type { LiteralNode, ParseFunction } from "../../../parseNodeTypes.js";

export const parseZodLiteralDef: ParseFunction<ZodLiteralDef, LiteralNode> = (
	def,
	refs,
) => {
	refs.addDataFunctions.addDescriptionIfExists(def, refs);
	return {
		type: "literal",
		value: def.value,
		...nodePropertiesFromRef(refs),
	};
};
