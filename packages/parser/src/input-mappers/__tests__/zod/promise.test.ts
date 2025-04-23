import { defaultReferences } from "@src/input-mappers/defaultReferences.js";
import { parseZodPromiseDef } from "@src/input-mappers/zod/parsers/parseZodPromiseDef.js";
import type { NumberNode } from "@src/parseNodeTypes.js";
import { z } from "zod";
import { describe, it, expect } from "vitest";

describe("Parse ZodPromise", () => {
	it("should parse a zod promise as it's underlying node type", () => {
		const expected: NumberNode = {
			type: "number",
			path: [],
		};
		const schema = z.number().promise();
		expect(parseZodPromiseDef(schema._def, defaultReferences())).toStrictEqual(
			expected,
		);
	});
});
