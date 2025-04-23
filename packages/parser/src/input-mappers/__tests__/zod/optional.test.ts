import { defaultReferences } from "@src/input-mappers/defaultReferences.js";
import { parseZodOptionalDef } from "@src/input-mappers/zod/parsers/parseZodOptionalDef.js";
import type { NumberNode, ObjectNode } from "@src/parseNodeTypes.js";
import { z } from "zod";
import { describe, it, expect } from "vitest";

describe("Parse ZodOptional", () => {
	it("should return it's parsed inner type with optional true", () => {
		const expected: NumberNode = {
			type: "number",
			optional: true,
			path: [],
		};
		const schema = z.number().optional();
		expect(parseZodOptionalDef(schema._def, defaultReferences())).toStrictEqual(
			expected,
		);
	});
	it("should not apply optional: true to nodes that are not direct children", () => {
		const expected: ObjectNode = {
			optional: true,
			type: "object",
			path: [],
			children: {
				number: {
					type: "number",
					path: ["number"],
				},
			},
		};
		const schema = z
			.object({
				number: z.number(),
			})
			.optional();
		expect(parseZodOptionalDef(schema._def, defaultReferences())).toStrictEqual(
			expected,
		);
	});
});
