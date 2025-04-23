import { defaultReferences } from "../../defaultReferences.js";
import { parseZodArrayDef } from "../../zod/parsers/parseZodArrayDef.js";
import { parseZodObjectDef } from "../../zod/parsers/parseZodObjectDef.js";
import type { ArrayNode, ObjectNode } from "../../../parseNodeTypes.js";
import { z } from "zod";
import { describe, it, expect } from "vitest";

describe("Parse Zod Array", () => {
	it("should parse a string array schema", () => {
		const expected: ArrayNode = {
			type: "array",
			childType: {
				type: "string",
				path: [],
			},
			path: [],
		};
		const schema = z.string().array();
		const parsed = parseZodArrayDef(schema._def, defaultReferences());
		expect(parsed).toStrictEqual(expected);
	});

	it("should pass an empty array as the path for object-nested array childType", () => {
		const expected: ObjectNode = {
			type: "object",
			children: {
				childArray: {
					type: "array",
					path: ["childArray"],
					childType: {
						type: "string",
						path: [],
					},
				},
			},
			path: [],
		};
		const schema = z.object({
			childArray: z.string().array(),
		});
		const parsed = parseZodObjectDef(schema._def, defaultReferences());
		expect(parsed).toStrictEqual(expected);
	});
});
