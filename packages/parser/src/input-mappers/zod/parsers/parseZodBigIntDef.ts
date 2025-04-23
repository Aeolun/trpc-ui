import type {
	ParsedInputNode,
	ParseReferences,
} from "../../../parseNodeTypes.js";
import { nodePropertiesFromRef } from "../../../utils.js";
import type { ZodBigIntDef } from "zod";

export function parseZodBigIntDef(
	def: ZodBigIntDef,
	refs: ParseReferences,
): ParsedInputNode {
	refs.addDataFunctions.addDescriptionIfExists(def, refs);
	return {
		type: "number",
		...nodePropertiesFromRef(refs),
	};
}
