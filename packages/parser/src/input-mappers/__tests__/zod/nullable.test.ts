import { defaultReferences } from "@src/input-mappers/defaultReferences.js";
import { parseZodNullableDef } from "@src/input-mappers/zod/parsers/parseZodNullableDef.js";
import type { NumberNode } from "@src/parseNodeTypes.js";
import { z } from "zod";
import { describe, it, expect } from "vitest";

describe("Parse ZodNullable", () => {
	it("should parse a nullable as it's underlying type", () => {
		const expected: NumberNode = {
			type: "number",
			path: [],
		};
		const schema = z.number().nullable();
		expect(parseZodNullableDef(schema._def, defaultReferences())).toStrictEqual(
			expected,
		);
	});
});
