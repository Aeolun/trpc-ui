import { defaultReferences } from "@src/input-mappers/defaultReferences.js";
import { parseZodEffectsDef } from "@src/input-mappers/zod/parsers/parseZodEffectsDef.js";
import type { StringNode } from "@src/parseNodeTypes.js";
import { z } from "zod";
import { describe, it, expect } from "vitest";

describe("Parse ZodEffects", () => {
	it("should parse a zod effects string as an string", () => {
		const expected: StringNode = {
			type: "string",
			path: [],
		};
		const schema = z.preprocess((val) => String(val), z.string());
		expect(parseZodEffectsDef(schema._def, defaultReferences())).toStrictEqual(
			expected,
		);
	});
});
