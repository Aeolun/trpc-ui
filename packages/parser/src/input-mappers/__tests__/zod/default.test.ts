import { defaultReferences } from "@src/input-mappers/defaultReferences.js";
import { parseZodDefaultDef } from "@src/input-mappers/zod/parsers/parseZodDefaultDef.js";
import type { ParsedInputNode } from "@src/parseNodeTypes.js";
import { z } from "zod";
import { describe, it, expect } from "vitest";

describe("Parse ZodDefault", () => {
	it("should parse zod number with default as number", () => {
		const expected: ParsedInputNode = {
			type: "number",
			path: [],
		};
		const zodSchema = z.number().default(5);
		const parsed = parseZodDefaultDef(zodSchema._def, defaultReferences());
		expect(parsed).toStrictEqual(expected);
	});
});
