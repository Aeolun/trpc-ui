import type {
	ParseReferences,
	SharedInputNodeProperties,
} from "./parseNodeTypes.js";

export function nodePropertiesFromRef(
	references: ParseReferences,
): SharedInputNodeProperties {
	return {
		path: references.path,
		...(references.optional && { optional: true }),
	};
}
