import type {
	ParsedInputNode,
	ParseReferences,
} from "../../../parseNodeTypes.js";
import { nodePropertiesFromRef } from "../../../utils.js";
import type { ZodNullDef } from "zod";

export function parseZodNullDef(
	def: ZodNullDef,
	refs: ParseReferences,
): ParsedInputNode {
	refs.addDataFunctions.addDescriptionIfExists(def, refs);
	return {
		type: "literal",
		value: null,
		...nodePropertiesFromRef(refs),
	};
}
