// ABOUTME: Utility functions for filtering routers and procedures based on tags.
// ABOUTME: Provides recursive logic to determine if a router has any matching descendants.

import type { ParsedRouter } from "@aeolun/trpc-router-parser";
import { procedureMatchesFilters } from "@src/react-app/components/contexts/FilterContext";

/**
 * Recursively checks if a router has any descendant procedures that match the selected filters.
 * Returns true if any descendant procedure matches, false otherwise.
 * If no filters are selected, always returns true.
 */
export function routerHasMatchingDescendants(
	router: ParsedRouter,
	selectedTags: Set<string>,
): boolean {
	// If no filters are selected, all routers are visible
	if (selectedTags.size === 0) return true;

	// Check all children
	for (const child of Object.values(router.children)) {
		if (child.nodeType === "procedure") {
			// If this procedure matches the filters, the router has matching descendants
			if (procedureMatchesFilters(child.extraData.tags, selectedTags)) {
				return true;
			}
		} else if (child.nodeType === "router") {
			// Recursively check nested routers
			if (routerHasMatchingDescendants(child, selectedTags)) {
				return true;
			}
		}
	}

	// No matching descendants found
	return false;
}
