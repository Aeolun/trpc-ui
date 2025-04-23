import { defaultReferences } from "@src/input-mappers/defaultReferences.js";
import {
	parseZodDiscriminatedUnionDef,
	type ZodDiscriminatedUnionDefUnversioned,
} from "@src/input-mappers/zod/parsers/parseZodDiscriminatedUnionDef.js";
import type { DiscriminatedUnionNode } from "@src/parseNodeTypes.js";
import { z } from "zod";
import { describe, it, expect } from "vitest";

describe("Parse Zod Discriminated Union", () => {
	//write test
	it("should parse a discriminated union node", () => {
		const expected: DiscriminatedUnionNode = {
			type: "discriminated-union",
			path: [],
			discriminatorName: "disc",
			discriminatedUnionValues: ["one", "two"],
			discriminatedUnionChildrenMap: {
				one: {
					type: "object",
					children: {
						numberPropertyOne: {
							type: "number",
							path: ["numberPropertyOne"],
						},
						disc: {
							type: "literal",
							path: ["disc"],
							value: "one",
						},
					},
					path: [],
				},
				two: {
					type: "object",
					children: {
						stringPropertyTwo: {
							type: "string",
							path: ["stringPropertyTwo"],
						},
						disc: {
							type: "literal",
							path: ["disc"],
							value: "two",
						},
					},
					path: [],
				},
			},
		};
		const zodSchema = z.discriminatedUnion("disc", [
			z.object({
				disc: z.literal("one"),
				numberPropertyOne: z.number(),
			}),
			z.object({
				disc: z.literal("two"),
				stringPropertyTwo: z.string(),
			}),
		]);
		const parsedZod = parseZodDiscriminatedUnionDef(
			zodSchema._def as unknown as ZodDiscriminatedUnionDefUnversioned,
			defaultReferences(),
		);
		expect(parsedZod).toStrictEqual(expected);
	});
});
