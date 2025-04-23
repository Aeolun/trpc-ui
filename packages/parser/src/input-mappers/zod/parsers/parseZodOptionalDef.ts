import { zodSelectorFunction } from "../../../input-mappers/zod/selector.js";
import type {
	ParsedInputNode,
	ParseFunction,
} from "../../../parseNodeTypes.js";
import type { ZodOptionalDef } from "zod";

export const parseZodOptionalDef: ParseFunction<
	ZodOptionalDef,
	ParsedInputNode
> = (def, refs) => {
	const parsedInner = zodSelectorFunction(def.innerType._def, refs);
	refs.addDataFunctions.addDescriptionIfExists(def, refs);
	return {
		...parsedInner,
		optional: true,
	};
};
