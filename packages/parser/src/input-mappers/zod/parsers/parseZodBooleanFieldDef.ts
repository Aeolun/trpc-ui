import { nodePropertiesFromRef } from "../../../utils.js";
import type { ZodBooleanDef } from "zod";
import type { BooleanNode, ParseFunction } from "../../../parseNodeTypes.js";

export const parseZodBooleanFieldDef: ParseFunction<
	ZodBooleanDef,
	BooleanNode
> = (def, refs) => {
	refs.addDataFunctions.addDescriptionIfExists(def, refs);
	return { type: "boolean", ...nodePropertiesFromRef(refs) };
};
