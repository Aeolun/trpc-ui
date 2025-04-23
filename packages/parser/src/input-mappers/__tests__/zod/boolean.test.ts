import { defaultReferences } from "../../defaultReferences.js";
import { parseZodBooleanFieldDef } from "../../zod/parsers/parseZodBooleanFieldDef.js";
import type { BooleanNode } from "../../../parseNodeTypes.js";
import { z } from "zod";
import { describe, it, expect } from "vitest";

describe("Parse Zod Boolean", () => {
	it("should parse a zod boolean as a boolean node", () => {
		const expected: BooleanNode = {
			type: "boolean",
			path: [],
		};
		const schema = z.boolean();
		const parsed = parseZodBooleanFieldDef(schema._def, defaultReferences());
		expect(parsed).toStrictEqual(expected);
	});
});
