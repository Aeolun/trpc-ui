import { defaultReferences } from "@src/input-mappers/defaultReferences.js";
import { parseZodLiteralDef } from "@src/input-mappers/zod/parsers/parseZodLiteralDef.js";
import type { LiteralNode } from "@src/parseNodeTypes.js";
import { z } from "zod";
import { describe, it, expect } from "vitest";

describe("Parse ZodLiteral", () => {
	it("should parse a zod literal for each possible type", () => {
		const testCases: {
			value: LiteralNode["value"];
			expectedNode: LiteralNode;
		}[] = [
			{
				value: "string",
				expectedNode: {
					type: "literal",
					value: "string",
					path: [],
				},
			},
			{
				value: 5,
				expectedNode: {
					type: "literal",
					value: 5,
					path: [],
				},
			},
			{
				value: undefined,
				expectedNode: {
					type: "literal",
					value: undefined,
					path: [],
				},
			},
			{
				value: null,
				expectedNode: {
					value: null,
					type: "literal",
					path: [],
				},
			},
			{
				value: BigInt(5),
				expectedNode: {
					value: BigInt(5),
					type: "literal",
					path: [],
				},
			},
		];
		for (const testCase of testCases) {
			expect(
				parseZodLiteralDef(z.literal(testCase.value)._def, defaultReferences()),
			).toStrictEqual(testCase.expectedNode);
		}
	});
});
