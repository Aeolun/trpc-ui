import { defaultReferences } from "@src/input-mappers/defaultReferences.js";
import { parseZodNativeEnumDef } from "@src/input-mappers/zod/parsers/parseZodNativeEnumDef.js";
import type { EnumNode } from "@src/parseNodeTypes.js";
import { z } from "zod";
import { describe, it, expect } from "vitest";

describe("Parse ZodNativeEnum", () => {
	it("should parse a zod native enum", () => {
		const expected: EnumNode = {
			type: "enum",
			enumValues: ["one", "two", "three"],
			path: [],
		};

		enum ExampleEnum {
			ONE = "one",
			TWO = "two",
			THREE = "three",
		}

		const parsed = parseZodNativeEnumDef(
			z.nativeEnum(ExampleEnum)._def,
			defaultReferences(),
		);
		expect(expected).toStrictEqual(parsed);
	});
});
