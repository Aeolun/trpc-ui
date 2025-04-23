import { zodSelectorFunction } from "../../../input-mappers/zod/selector.js";
import type {
	ParsedInputNode,
	ParseReferences,
} from "../../../parseNodeTypes.js";
import type { ZodDefaultDef } from "zod";

export function parseZodDefaultDef(
	def: ZodDefaultDef,
	refs: ParseReferences,
): ParsedInputNode {
	refs.addDataFunctions.addDescriptionIfExists(def, refs);
	return zodSelectorFunction(def.innerType._def, refs);
}
