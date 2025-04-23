import { nodePropertiesFromRef } from "../../../utils.js";
import type { ZodUndefinedDef } from "zod";
import type {
	ParsedInputNode,
	ParseReferences,
} from "../../../parseNodeTypes.js";

export function parseZodUndefinedDef(
	def: ZodUndefinedDef,
	refs: ParseReferences,
): ParsedInputNode {
	refs.addDataFunctions.addDescriptionIfExists(def, refs);
	return {
		type: "literal",
		value: undefined,
		...nodePropertiesFromRef(refs),
	};
}
