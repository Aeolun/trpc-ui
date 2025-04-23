import { defaultReferences } from "@src/input-mappers/defaultReferences.js";
import { parseZodVoidDef } from "@src/input-mappers/zod/parsers/parseZodVoidDef.js";
import { zodSelectorFunction } from "@src/input-mappers/zod/selector.js";
import type { LiteralNode } from "@src/parseNodeTypes.js";
import { z } from "zod";
import { describe, it, expect } from "vitest";

describe("Parse ZodVoid", () => {
	it("should parse a void def as a literal node with undefined value", () => {
		const expected: LiteralNode = {
			type: "literal",
			path: [],
			value: undefined,
		};
		const zodSchema = z.void();
		const parsed = parseZodVoidDef(zodSchema._def, defaultReferences());
		expect(parsed).toStrictEqual(expected);
	});

	it("should be mapped correctly via the selector and parsed as a literal node", () => {
		const expected: LiteralNode = {
			type: "literal",
			path: [],
			value: undefined,
		};
		const zodSchema = z.void();
		const parsed = zodSelectorFunction(zodSchema._def, defaultReferences());
		expect(parsed).toStrictEqual(expected);
	});
});
