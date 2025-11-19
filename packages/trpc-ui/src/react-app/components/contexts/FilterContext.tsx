import { createContext, useContext, useState, type ReactNode } from "react";
import type { Tag } from "@aeolun/trpc-router-parser";
import { UNTAGGED_TAG } from "@src/react-app/utils/collectTags";

type FilterContextType = {
	selectedTags: Set<string>;
	toggleTag: (tagText: string) => void;
	isTagSelected: (tagText: string) => boolean;
	clearFilters: () => void;
};

const FilterContext = createContext<FilterContextType | null>(null);

export function FilterContextProvider({ children }: { children: ReactNode }) {
	const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

	const toggleTag = (tagText: string) => {
		setSelectedTags((prev) => {
			const next = new Set(prev);
			if (next.has(tagText)) {
				next.delete(tagText);
			} else {
				next.add(tagText);
			}
			return next;
		});
	};

	const isTagSelected = (tagText: string) => selectedTags.has(tagText);

	const clearFilters = () => setSelectedTags(new Set());

	return (
		<FilterContext.Provider
			value={{ selectedTags, toggleTag, isTagSelected, clearFilters }}
		>
			{children}
		</FilterContext.Provider>
	);
}

export function useFilters() {
	const context = useContext(FilterContext);
	if (!context) {
		throw new Error("useFilters must be used within FilterContextProvider");
	}
	return context;
}

export function procedureMatchesFilters(
	procedureTags: Tag[] | undefined,
	selectedTags: Set<string>,
): boolean {
	if (selectedTags.size === 0) return true;

	const isUntagged = !procedureTags || procedureTags.length === 0;

	// If "UNTAGGED" is selected
	if (selectedTags.has(UNTAGGED_TAG.text)) {
		// If this procedure is untagged
		if (isUntagged) {
			// If ONLY "UNTAGGED" is selected, show it
			if (selectedTags.size === 1) return true;
			// If other tags are also selected, untagged procedures don't match
			return false;
		}
		// If this procedure has tags and UNTAGGED is selected, don't show it
		return false;
	}

	// If procedure has no tags and UNTAGGED is not selected, don't show
	if (isUntagged) return false;

	const procedureTagTexts = new Set(procedureTags.map((t) => t.text));
	// Must match ALL selected filters (AND logic)
	for (const selectedTag of selectedTags) {
		if (!procedureTagTexts.has(selectedTag)) {
			return false;
		}
	}
	return true;
}
