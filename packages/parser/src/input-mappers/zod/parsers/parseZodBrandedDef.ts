import { zodSelectorFunction } from "../../../input-mappers/zod/selector.js";
import type {
	ParsedInputNode,
	ParseReferences,
} from "../../../parseNodeTypes.js";
import type { AnyZodObject, ZodBrandedDef } from "zod";

export function parseZodBrandedDef(
	def: ZodBrandedDef<AnyZodObject>,
	refs: ParseReferences,
): ParsedInputNode {
	refs.addDataFunctions.addDescriptionIfExists(def, refs);
	return zodSelectorFunction(def.type._def, refs);
}
