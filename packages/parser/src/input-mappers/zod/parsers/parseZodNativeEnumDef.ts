import { nodePropertiesFromRef } from "../../../utils.js";
import type { ZodNativeEnumDef } from "zod";
import type { EnumNode, ParseFunction } from "../../../parseNodeTypes.js";

export const parseZodNativeEnumDef: ParseFunction<
	ZodNativeEnumDef,
	EnumNode
> = (def, refs) => {
	const values = Object.values(def.values) as string[];
	refs.addDataFunctions.addDescriptionIfExists(def, refs);
	return { type: "enum", enumValues: values, ...nodePropertiesFromRef(refs) };
};
