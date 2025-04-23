import { defaultReferences } from "@src/input-mappers/defaultReferences.js";
import { parseZodEnumDef } from "@src/input-mappers/zod/parsers/parseZodEnumDef.js";
import type { EnumNode } from "@src/parseNodeTypes.js";
import { z } from "zod";
import { describe, it, expect } from "vitest";

describe("Parse ZodEnum", () => {
	it("should parse a zod enum", () => {
		const expected: EnumNode = {
			type: "enum",
			enumValues: ["one", "two", "three"],
			path: [],
		};
		const parsed = parseZodEnumDef(
			z.enum(["one", "two", "three"])._def,
			defaultReferences(),
		);
		expect(expected).toStrictEqual(parsed);
	});
});
