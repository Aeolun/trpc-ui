import type { ParsedRouter, ParsedProcedure } from "@aeolun/trpc-router-parser";
import type { Tag } from "@aeolun/trpc-router-parser";

export const UNTAGGED_TAG: Tag = {
	text: "UNTAGGED",
	color: "#9ca3af", // gray
};

export function collectAllTags(router: ParsedRouter): Tag[] {
	const tagMap = new Map<string, Tag>();
	let hasUntagged = false;

	function walkNode(node: ParsedRouter | ParsedProcedure) {
		if (node.nodeType === "procedure") {
			const procedure = node as ParsedProcedure;
			if (procedure.extraData.tags && procedure.extraData.tags.length > 0) {
				for (const tag of procedure.extraData.tags) {
					if (!tagMap.has(tag.text)) {
						tagMap.set(tag.text, tag);
					}
				}
			} else {
				hasUntagged = true;
			}
		} else if (node.nodeType === "router") {
			const router = node as ParsedRouter;
			for (const child of Object.values(router.children)) {
				walkNode(child);
			}
		}
	}

	walkNode(router);
	const tags = Array.from(tagMap.values());

	// Add untagged filter if there are any untagged procedures
	if (hasUntagged) {
		tags.push(UNTAGGED_TAG);
	}

	return tags;
}
