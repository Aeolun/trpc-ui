import { defaultReferences } from "@src/input-mappers/defaultReferences.js";
import { parseZodNullDef } from "@src/input-mappers/zod/parsers/parseZodNullDef.js";
import type { LiteralNode } from "@src/parseNodeTypes.js";
import { z } from "zod";
import { describe, it, expect } from "vitest";

describe("Parse ZodNull", () => {
	it("should parse a zod nullable as a literal with value null", () => {
		const expected: LiteralNode = {
			type: "literal",
			value: null,
			path: [],
		};
		const schema = z.null();
		expect(parseZodNullDef(schema._def, defaultReferences())).toStrictEqual(
			expected,
		);
	});
});
