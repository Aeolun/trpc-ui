import { nodePropertiesFromRef } from "../../../utils.js";
import type { ZodEnumDef } from "zod";
import type { EnumNode, ParseFunction } from "../../../parseNodeTypes.js";

export const parseZodEnumDef: ParseFunction<ZodEnumDef, EnumNode> = (
	def,
	refs,
) => {
	const values = def.values as unknown as string[];
	refs.addDataFunctions.addDescriptionIfExists(def, refs);
	return { type: "enum", enumValues: values, ...nodePropertiesFromRef(refs) };
};
