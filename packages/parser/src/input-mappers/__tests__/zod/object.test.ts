import { defaultReferences } from "@src/input-mappers/defaultReferences.js";
import { parseZodObjectDef } from "@src/input-mappers/zod/parsers/parseZodObjectDef.js";
import type { ObjectNode } from "@src/parseNodeTypes.js";
import { z } from "zod";
import { describe, it, expect } from "vitest";

describe("Parse ZodObject", () => {
	it("should parse an empty zod object", () => {
		const expected: ObjectNode = {
			type: "object",
			children: {},
			path: [],
		};
		const schema = z.object({});
		expect(parseZodObjectDef(schema._def, defaultReferences())).toStrictEqual(
			expected,
		);
	});
	it("should parse an object with different property types", () => {
		const expected: ObjectNode = {
			type: "object",
			children: {
				number: {
					type: "number",
					path: ["number"],
				},
				string: {
					type: "string",
					path: ["string"],
				},
			},
			path: [],
		};
		const schema = z.object({
			number: z.number(),
			string: z.string(),
		});
		expect(parseZodObjectDef(schema._def, defaultReferences())).toStrictEqual(
			expected,
		);
	});
	it("should correctly create nested object paths", () => {
		const expected: ObjectNode = {
			type: "object",
			path: [],
			children: {
				obj: {
					type: "object",
					path: ["obj"],
					children: {
						obj2: {
							type: "object",
							path: ["obj", "obj2"],
							children: {
								str: {
									type: "string",
									path: ["obj", "obj2", "str"],
								},
							},
						},
					},
				},
			},
		};
		const schema = z.object({
			obj: z.object({
				obj2: z.object({
					str: z.string(),
				}),
			}),
		});
		expect(parseZodObjectDef(schema._def, defaultReferences())).toStrictEqual(
			expected,
		);
	});
});
