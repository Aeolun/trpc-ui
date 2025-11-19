// ABOUTME: Tests for the procedureMatchesFilters function.
// ABOUTME: Verifies correct filtering behavior for tagged and untagged procedures.

import { describe, it, expect } from "vitest";
import { procedureMatchesFilters } from "../FilterContext";
import type { Tag } from "@aeolun/trpc-router-parser";

describe("procedureMatchesFilters", () => {
	it("should show all procedures when no filters are selected", () => {
		const tags: Tag[] = [{ text: "admin", color: "blue" }];
		const selectedTags = new Set<string>();
		expect(procedureMatchesFilters(tags, selectedTags)).toBe(true);
		expect(procedureMatchesFilters(undefined, selectedTags)).toBe(true);
	});

	it("should show untagged procedures when UNTAGGED is selected", () => {
		const selectedTags = new Set(["UNTAGGED"]);
		expect(procedureMatchesFilters(undefined, selectedTags)).toBe(true);
		expect(procedureMatchesFilters([], selectedTags)).toBe(true);
	});

	it("should NOT show tagged procedures when only UNTAGGED is selected", () => {
		const tags: Tag[] = [{ text: "admin", color: "blue" }];
		const selectedTags = new Set(["UNTAGGED"]);
		expect(procedureMatchesFilters(tags, selectedTags)).toBe(false);
	});

	it("should show procedures that match the selected tag", () => {
		const tags: Tag[] = [{ text: "admin", color: "blue" }];
		const selectedTags = new Set(["admin"]);
		expect(procedureMatchesFilters(tags, selectedTags)).toBe(true);
	});

	it("should NOT show procedures that don't have the selected tag", () => {
		const tags: Tag[] = [{ text: "user", color: "green" }];
		const selectedTags = new Set(["admin"]);
		expect(procedureMatchesFilters(tags, selectedTags)).toBe(false);
	});

	it("should require ALL selected tags (AND logic)", () => {
		const tags: Tag[] = [
			{ text: "admin", color: "blue" },
			{ text: "write", color: "red" },
		];
		const selectedTags = new Set(["admin", "write"]);
		expect(procedureMatchesFilters(tags, selectedTags)).toBe(true);
	});

	it("should NOT show procedures that are missing one of the selected tags", () => {
		const tags: Tag[] = [{ text: "admin", color: "blue" }];
		const selectedTags = new Set(["admin", "write"]);
		expect(procedureMatchesFilters(tags, selectedTags)).toBe(false);
	});

	it("should NOT show untagged procedures when UNTAGGED is selected with other tags", () => {
		const selectedTags = new Set(["UNTAGGED", "admin"]);
		expect(procedureMatchesFilters(undefined, selectedTags)).toBe(false);
		expect(procedureMatchesFilters([], selectedTags)).toBe(false);
	});

	it("should NOT show tagged procedures when UNTAGGED is selected with other tags", () => {
		const tags: Tag[] = [{ text: "admin", color: "blue" }];
		const selectedTags = new Set(["UNTAGGED", "admin"]);
		expect(procedureMatchesFilters(tags, selectedTags)).toBe(false);
	});
});
