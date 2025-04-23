import type { ParseReferences } from "../parseNodeTypes.js";

export function defaultReferences(): ParseReferences {
	return {
		path: [],
		options: {},
		addDataFunctions: {
			addDescriptionIfExists: () => {},
		},
	};
}
