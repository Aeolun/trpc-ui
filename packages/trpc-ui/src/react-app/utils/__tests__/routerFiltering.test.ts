// ABOUTME: Tests for router filtering utilities.
// ABOUTME: Verifies that routers with no matching procedures are correctly filtered out.

import { describe, it, expect } from "vitest";
import { routerHasMatchingDescendants } from "../routerFiltering";
import type { ParsedRouter, ParsedProcedure } from "@aeolun/trpc-router-parser";

describe("routerHasMatchingDescendants", () => {
	it("should return true when router has no filters applied", () => {
		const router: ParsedRouter = {
			nodeType: "router",
			path: [],
			children: {
				proc1: {
					nodeType: "procedure",
					procedureType: "query",
					pathFromRootRouter: ["proc1"],
					inputSchema: {},
					extraData: {
						parameterDescriptions: {},
					},
				} as ParsedProcedure,
			},
		};

		const result = routerHasMatchingDescendants(router, new Set());
		expect(result).toBe(true);
	});

	it("should return true when router contains a matching procedure", () => {
		const router: ParsedRouter = {
			nodeType: "router",
			path: [],
			children: {
				proc1: {
					nodeType: "procedure",
					procedureType: "query",
					pathFromRootRouter: ["proc1"],
					inputSchema: {},
					extraData: {
						parameterDescriptions: {},
						tags: [{ text: "admin", color: "blue" }],
					},
				} as ParsedProcedure,
			},
		};

		const selectedTags = new Set(["admin"]);
		const result = routerHasMatchingDescendants(router, selectedTags);
		expect(result).toBe(true);
	});

	it("should return false when router contains only non-matching procedures", () => {
		const router: ParsedRouter = {
			nodeType: "router",
			path: [],
			children: {
				proc1: {
					nodeType: "procedure",
					procedureType: "query",
					pathFromRootRouter: ["proc1"],
					inputSchema: {},
					extraData: {
						parameterDescriptions: {},
						tags: [{ text: "user", color: "green" }],
					},
				} as ParsedProcedure,
			},
		};

		const selectedTags = new Set(["admin"]);
		const result = routerHasMatchingDescendants(router, selectedTags);
		expect(result).toBe(false);
	});

	it("should return true when nested router contains a matching procedure", () => {
		const router: ParsedRouter = {
			nodeType: "router",
			path: [],
			children: {
				nestedRouter: {
					nodeType: "router",
					path: ["nestedRouter"],
					children: {
						proc1: {
							nodeType: "procedure",
							procedureType: "query",
							pathFromRootRouter: ["nestedRouter", "proc1"],
							inputSchema: {},
							extraData: {
								parameterDescriptions: {},
								tags: [{ text: "admin", color: "blue" }],
							},
						} as ParsedProcedure,
					},
				},
			},
		};

		const selectedTags = new Set(["admin"]);
		const result = routerHasMatchingDescendants(router, selectedTags);
		expect(result).toBe(true);
	});

	it("should return false when nested router contains only non-matching procedures", () => {
		const router: ParsedRouter = {
			nodeType: "router",
			path: [],
			children: {
				nestedRouter: {
					nodeType: "router",
					path: ["nestedRouter"],
					children: {
						proc1: {
							nodeType: "procedure",
							procedureType: "query",
							pathFromRootRouter: ["nestedRouter", "proc1"],
							inputSchema: {},
							extraData: {
								parameterDescriptions: {},
								tags: [{ text: "user", color: "green" }],
							},
						} as ParsedProcedure,
					},
				},
			},
		};

		const selectedTags = new Set(["admin"]);
		const result = routerHasMatchingDescendants(router, selectedTags);
		expect(result).toBe(false);
	});

	it("should return true when router has multiple nested levels with a matching procedure deep down", () => {
		const router: ParsedRouter = {
			nodeType: "router",
			path: [],
			children: {
				level1: {
					nodeType: "router",
					path: ["level1"],
					children: {
						level2: {
							nodeType: "router",
							path: ["level1", "level2"],
							children: {
								proc1: {
									nodeType: "procedure",
									procedureType: "query",
									pathFromRootRouter: ["level1", "level2", "proc1"],
									inputSchema: {},
									extraData: {
										parameterDescriptions: {},
										tags: [{ text: "admin", color: "blue" }],
									},
								} as ParsedProcedure,
							},
						},
					},
				},
			},
		};

		const selectedTags = new Set(["admin"]);
		const result = routerHasMatchingDescendants(router, selectedTags);
		expect(result).toBe(true);
	});

	it("should return true when router has some matching and some non-matching procedures", () => {
		const router: ParsedRouter = {
			nodeType: "router",
			path: [],
			children: {
				proc1: {
					nodeType: "procedure",
					procedureType: "query",
					pathFromRootRouter: ["proc1"],
					inputSchema: {},
					extraData: {
						parameterDescriptions: {},
						tags: [{ text: "user", color: "green" }],
					},
				} as ParsedProcedure,
				proc2: {
					nodeType: "procedure",
					procedureType: "query",
					pathFromRootRouter: ["proc2"],
					inputSchema: {},
					extraData: {
						parameterDescriptions: {},
						tags: [{ text: "admin", color: "blue" }],
					},
				} as ParsedProcedure,
			},
		};

		const selectedTags = new Set(["admin"]);
		const result = routerHasMatchingDescendants(router, selectedTags);
		expect(result).toBe(true);
	});

	it("should handle untagged procedures with UNTAGGED filter", () => {
		const router: ParsedRouter = {
			nodeType: "router",
			path: [],
			children: {
				proc1: {
					nodeType: "procedure",
					procedureType: "query",
					pathFromRootRouter: ["proc1"],
					inputSchema: {},
					extraData: {
						parameterDescriptions: {},
					},
				} as ParsedProcedure,
			},
		};

		const selectedTags = new Set(["UNTAGGED"]);
		const result = routerHasMatchingDescendants(router, selectedTags);
		expect(result).toBe(true);
	});
});
