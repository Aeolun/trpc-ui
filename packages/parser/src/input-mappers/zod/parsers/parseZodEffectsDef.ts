import { zodSelectorFunction } from "../../../input-mappers/zod/selector.js";
import type {
	ParsedInputNode,
	ParseReferences,
} from "../../../parseNodeTypes.js";
import type { ZodEffectsDef } from "zod";

export function parseZodEffectsDef(
	def: ZodEffectsDef,
	refs: ParseReferences,
): ParsedInputNode {
	refs.addDataFunctions.addDescriptionIfExists(def, refs);
	return zodSelectorFunction(def.schema._def, refs);
}
