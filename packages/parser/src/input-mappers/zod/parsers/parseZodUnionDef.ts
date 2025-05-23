import { nodePropertiesFromRef } from "../../../utils.js";
import type { ZodUnionDef } from "zod";
import type {
	LiteralNode,
	ParseFunction,
	UnionNode,
} from "../../../parseNodeTypes.js";
import { zodSelectorFunction } from "../selector.js";

export const parseZodUnionDef: ParseFunction<ZodUnionDef, UnionNode> = (
	def,
	refs,
) => {
	refs.addDataFunctions.addDescriptionIfExists(def, refs);
	return {
		type: "union",
		values: def.options.map(
			(o) => zodSelectorFunction(o._def, { ...refs, path: [] }) as LiteralNode,
		),
		...nodePropertiesFromRef(refs),
	};
};
