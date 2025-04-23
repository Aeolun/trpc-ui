import { defaultReferences } from "@src/input-mappers/defaultReferences.js";
import { parseZodStringDef } from "@src/input-mappers/zod/parsers/parseZodStringDef.js";
import type { StringNode } from "@src/parseNodeTypes.js";
import { z } from "zod";
import { describe, it, expect } from "vitest";

describe("Parse ZodString", () => {
	it("should parse a string schema as a string node", () => {
		const expected: StringNode = {
			type: "string",
			path: [],
		};
		const schema = z.string();
		expect(parseZodStringDef(schema._def, defaultReferences())).toStrictEqual(
			expected,
		);
	});
});
