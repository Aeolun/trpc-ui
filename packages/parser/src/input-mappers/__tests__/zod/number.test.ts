import { defaultReferences } from "@src/input-mappers/defaultReferences.js";
import { parseZodNumberDef } from "@src/input-mappers/zod/parsers/parseZodNumberDef.js";
import type { NumberNode } from "@src/parseNodeTypes.js";
import { z } from "zod";
import { describe, it, expect } from "vitest";

describe("Parse ZodNumber", () => {
	it("should parse a number node", () => {
		const expected: NumberNode = {
			type: "number",
			path: [],
		};
		const schema = z.number();
		expect(parseZodNumberDef(schema._def, defaultReferences())).toStrictEqual(
			expected,
		);
	});
});
