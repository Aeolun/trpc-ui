import { zodSelectorFunction } from "../../../input-mappers/zod/selector.js";
import type {
	ParsedInputNode,
	ParseReferences,
} from "../../../parseNodeTypes.js";
import type { ZodPromiseDef } from "zod";

export function parseZodPromiseDef(
	def: ZodPromiseDef,
	refs: ParseReferences,
): ParsedInputNode {
	refs.addDataFunctions.addDescriptionIfExists(def, refs);
	return zodSelectorFunction(def.type._def, refs);
}
