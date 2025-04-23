import { zodSelectorFunction } from "../../../input-mappers/zod/selector.js";
import type {
	ParsedInputNode,
	ParseReferences,
} from "../../../parseNodeTypes.js";
import type { ZodNullableDef } from "zod";

export function parseZodNullableDef(
	def: ZodNullableDef,
	refs: ParseReferences,
): ParsedInputNode {
	refs.addDataFunctions.addDescriptionIfExists(def, refs);
	return zodSelectorFunction(def.innerType._def, refs);
}
