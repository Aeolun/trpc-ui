import { defaultReferences } from "@src/input-mappers/defaultReferences.js";
import { parseZodUnionDef } from "@src/input-mappers/zod/parsers/parseZodUnionDef.js";
import type { UnionNode } from "@src/parseNodeTypes.js";
import { z } from "zod";
import { describe, it, expect } from "vitest";

describe("Parse Zod Union", () => {
	it("should parse a union node", () => {
		const expected: UnionNode = {
			type: "union",
			path: [],
			values: [
				{
					type: "literal",
					value: "one",
					path: [],
				},
				{
					type: "literal",
					value: 2,
					path: [],
				},
			],
		};
		const zodSchema = z.union([z.literal("one"), z.literal(2)]);
		const parsedZod = parseZodUnionDef(zodSchema._def, defaultReferences());
		expect(parsedZod).toStrictEqual(expected);
	});
});
