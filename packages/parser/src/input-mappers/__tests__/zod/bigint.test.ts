import { defaultReferences } from "../../defaultReferences.js";
import { parseZodBigIntDef } from "../../zod/parsers/parseZodBigIntDef.js";
import type { NumberNode } from "../../../parseNodeTypes.js";
import { z } from "zod";
import { describe, it, expect } from "vitest";

describe("Zod BigInt", () => {
	it("should parse a big end as a number node", () => {
		const expected: NumberNode = {
			type: "number",
			path: [],
		};
		const schema = z.bigint();
		const parsed = parseZodBigIntDef(schema._def, defaultReferences());
		expect(parsed).toStrictEqual(expected);
	});
});
