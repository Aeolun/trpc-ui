// ABOUTME: Tests for the custom JSON schema resolver for react-hook-form.
// ABOUTME: Validates schema validation, error mapping, and format support.

import { describe, it, expect } from "vitest";
import { jsonSchemaResolver } from "../jsonSchemaResolver";
import type { ResolverOptions } from "react-hook-form";

const defaultOptions = {
	criteriaMode: "firstError",
	fields: {},
	shouldUseNativeValidation: false,
} as ResolverOptions<Record<string, unknown>>;

describe("jsonSchemaResolver", () => {
	it("returns values and empty errors when validation passes", async () => {
		const schema = {
			type: "object" as const,
			properties: {
				vals: {
					type: "object" as const,
					properties: {
						name: { type: "string" as const },
					},
				},
			},
			$schema: "http://json-schema.org/draft-07/schema#",
		};

		const resolver = jsonSchemaResolver(schema);
		const result = await resolver(
			{ vals: { name: "hello" } },
			undefined,
			defaultOptions,
		);

		expect(result.errors).toEqual({});
		expect(result.values).toEqual({ vals: { name: "hello" } });
	});

	it("returns errors when required fields are missing", async () => {
		const schema = {
			type: "object" as const,
			properties: {
				vals: {
					type: "object" as const,
					properties: {
						name: { type: "string" as const },
					},
					required: ["name"],
				},
			},
			$schema: "http://json-schema.org/draft-07/schema#",
		};

		const resolver = jsonSchemaResolver(schema);
		const result = await resolver({ vals: {} }, undefined, defaultOptions);

		expect(result.values).toEqual({});
		expect(result.errors).toBeDefined();
		// The error should be nested at vals.name (the missing field, not the parent)
		expect(result.errors.vals).toBeDefined();
		expect((result.errors.vals as any).name).toBeDefined();
		expect((result.errors.vals as any).name.type).toBe("required");
	});

	it("returns errors when required fields are empty strings", async () => {
		const schema = {
			type: "object" as const,
			properties: {
				vals: {
					type: "object" as const,
					properties: {
						name: { type: "string" as const },
					},
					required: ["name"],
				},
			},
			$schema: "http://json-schema.org/draft-07/schema#",
		};

		const resolver = jsonSchemaResolver(schema);
		const result = await resolver(
			{ vals: { name: "" } },
			undefined,
			defaultOptions,
		);

		expect(result.values).toEqual({});
		expect(result.errors.vals).toBeDefined();
		expect((result.errors.vals as any).name).toBeDefined();
		expect((result.errors.vals as any).name.type).toBe("required");
	});

	it("returns errors for type mismatches", async () => {
		const schema = {
			type: "object" as const,
			properties: {
				vals: {
					type: "object" as const,
					properties: {
						age: { type: "number" as const },
					},
				},
			},
			$schema: "http://json-schema.org/draft-07/schema#",
		};

		const resolver = jsonSchemaResolver(schema);
		const result = await resolver(
			{ vals: { age: "not-a-number" } },
			undefined,
			defaultOptions,
		);

		expect(result.values).toEqual({});
		expect(result.errors.vals).toBeDefined();
	});

	it("validates string formats like email", async () => {
		const schema = {
			type: "object" as const,
			properties: {
				vals: {
					type: "object" as const,
					properties: {
						email: { type: "string" as const, format: "email" },
					},
				},
			},
			$schema: "http://json-schema.org/draft-07/schema#",
		};

		const resolver = jsonSchemaResolver(schema);
		const result = await resolver(
			{ vals: { email: "not-an-email" } },
			undefined,
			defaultOptions,
		);

		expect(result.values).toEqual({});
		expect(result.errors.vals).toBeDefined();
	});

	it("passes valid format values", async () => {
		const schema = {
			type: "object" as const,
			properties: {
				vals: {
					type: "object" as const,
					properties: {
						email: { type: "string" as const, format: "email" },
					},
				},
			},
			$schema: "http://json-schema.org/draft-07/schema#",
		};

		const resolver = jsonSchemaResolver(schema);
		const result = await resolver(
			{ vals: { email: "test@example.com" } },
			undefined,
			defaultOptions,
		);

		expect(result.errors).toEqual({});
		expect(result.values).toEqual({ vals: { email: "test@example.com" } });
	});

	it("handles undefined values in form data", async () => {
		const schema = {
			type: "object" as const,
			properties: {
				vals: {
					type: "object" as const,
					properties: {
						name: { type: "string" as const },
						age: { type: "number" as const },
						active: { type: "boolean" as const },
					},
				},
			},
			$schema: "http://json-schema.org/draft-07/schema#",
		};

		const resolver = jsonSchemaResolver(schema);
		const result = await resolver(
			{ vals: { name: undefined, age: undefined, active: undefined } },
			undefined,
			defaultOptions,
		);

		expect(result.errors).toEqual({});
		expect(result.values).toEqual({
			vals: { name: undefined, age: undefined, active: undefined },
		});
	});

	it("handles deeply nested validation errors", async () => {
		const schema = {
			type: "object" as const,
			properties: {
				vals: {
					type: "object" as const,
					properties: {
						user: {
							type: "object" as const,
							properties: {
								address: {
									type: "object" as const,
									properties: {
										zip: { type: "string" as const, minLength: 5 },
									},
								},
							},
						},
					},
				},
			},
			$schema: "http://json-schema.org/draft-07/schema#",
		};

		const resolver = jsonSchemaResolver(schema);
		const result = await resolver(
			{ vals: { user: { address: { zip: "12" } } } },
			undefined,
			defaultOptions,
		);

		expect(result.values).toEqual({});
		expect(result.errors.vals).toBeDefined();
	});
});
