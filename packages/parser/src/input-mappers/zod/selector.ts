import {
	type ZodArrayDef,
	type ZodBigIntDef,
	type ZodBooleanDef,
	type ZodBrandedDef,
	type ZodDefaultDef,
	type ZodEffectsDef,
	type ZodEnumDef,
	type ZodNativeEnumDef,
	ZodFirstPartyTypeKind,
	type ZodLiteralDef,
	type ZodNullableDef,
	type ZodNullDef,
	type ZodNumberDef,
	type ZodObjectDef,
	type ZodOptionalDef,
	type ZodPromiseDef,
	type ZodStringDef,
	type ZodUndefinedDef,
	type ZodUnionDef,
	type ZodVoidDef,
	type AnyZodObject,
} from "zod";
import { parseZodStringDef } from "./parsers/parseZodStringDef.js";
import type { ParserSelectorFunction } from "../../parseNodeTypes.js";
import type { ZodDefWithType } from "./zod-types.js";
import { parseZodArrayDef } from "./parsers/parseZodArrayDef.js";
import { parseZodBooleanFieldDef } from "./parsers/parseZodBooleanFieldDef.js";
import {
	parseZodDiscriminatedUnionDef,
	type ZodDiscriminatedUnionDefUnversioned,
} from "./parsers/parseZodDiscriminatedUnionDef.js";
import { parseZodEnumDef } from "./parsers/parseZodEnumDef.js";
import { parseZodNativeEnumDef } from "./parsers/parseZodNativeEnumDef.js";
import { parseZodLiteralDef } from "./parsers/parseZodLiteralDef.js";
import { parseZodNumberDef } from "./parsers/parseZodNumberDef.js";
import { parseZodObjectDef } from "./parsers/parseZodObjectDef.js";
import { parseZodOptionalDef } from "./parsers/parseZodOptionalDef.js";
import { parseZodNullableDef } from "./parsers/parseZodNullableDef.js";
import { parseZodBigIntDef } from "./parsers/parseZodBigIntDef.js";
import { parseZodBrandedDef } from "./parsers/parseZodBrandedDef.js";
import { parseZodDefaultDef } from "./parsers/parseZodDefaultDef.js";
import { parseZodEffectsDef } from "./parsers/parseZodEffectsDef.js";
import { parseZodNullDef } from "./parsers/parseZodNullDef.js";
import { parseZodPromiseDef } from "./parsers/parseZodPromiseDef.js";
import { parseZodUndefinedDef } from "./parsers/parseZodUndefinedDef.js";
import { parseZodUnionDef } from "./parsers/parseZodUnionDef.js";
import { parseZodVoidDef } from "./parsers/parseZodVoidDef.js";

export const zodSelectorFunction: ParserSelectorFunction<ZodDefWithType> = (
	def,
	references,
) => {
	// const optional = isZodOptional(zodAny);
	// const unwrappedOptional = optional ? zodAny._def.innerType : zodAny;
	// Please keep these in alphabetical order
	switch (def.typeName) {
		case ZodFirstPartyTypeKind.ZodArray:
			return parseZodArrayDef(def as ZodArrayDef, references);
		case ZodFirstPartyTypeKind.ZodBoolean:
			return parseZodBooleanFieldDef(def as ZodBooleanDef, references);
		case ZodFirstPartyTypeKind.ZodDiscriminatedUnion:
			return parseZodDiscriminatedUnionDef(
				// Zod had some type changes between 3.19 -> 3.20 and we want to support both, not sure there's a way
				// to avoid this.
				def as unknown as ZodDiscriminatedUnionDefUnversioned,
				references,
			);
		case ZodFirstPartyTypeKind.ZodEnum:
			return parseZodEnumDef(def as ZodEnumDef, references);
		case ZodFirstPartyTypeKind.ZodNativeEnum:
			return parseZodNativeEnumDef(def as ZodNativeEnumDef, references);
		case ZodFirstPartyTypeKind.ZodLiteral:
			return parseZodLiteralDef(def as ZodLiteralDef, references);
		case ZodFirstPartyTypeKind.ZodNumber:
			return parseZodNumberDef(def as ZodNumberDef, references);
		case ZodFirstPartyTypeKind.ZodObject:
			return parseZodObjectDef(def as ZodObjectDef, references);
		case ZodFirstPartyTypeKind.ZodOptional:
			return parseZodOptionalDef(def as ZodOptionalDef, references);
		case ZodFirstPartyTypeKind.ZodString:
			return parseZodStringDef(def as ZodStringDef, references);
		case ZodFirstPartyTypeKind.ZodNullable:
			return parseZodNullableDef(def as ZodNullableDef, references);
		case ZodFirstPartyTypeKind.ZodBigInt:
			return parseZodBigIntDef(def as ZodBigIntDef, references);
		case ZodFirstPartyTypeKind.ZodBranded:
			return parseZodBrandedDef(def as ZodBrandedDef<AnyZodObject>, references);
		case ZodFirstPartyTypeKind.ZodDefault:
			return parseZodDefaultDef(def as ZodDefaultDef, references);
		case ZodFirstPartyTypeKind.ZodEffects:
			return parseZodEffectsDef(def as ZodEffectsDef, references);
		case ZodFirstPartyTypeKind.ZodNull:
			return parseZodNullDef(def as ZodNullDef, references);
		case ZodFirstPartyTypeKind.ZodPromise:
			return parseZodPromiseDef(def as ZodPromiseDef, references);
		case ZodFirstPartyTypeKind.ZodUndefined:
			return parseZodUndefinedDef(def as ZodUndefinedDef, references);
		case ZodFirstPartyTypeKind.ZodUnion:
			return parseZodUnionDef(def as ZodUnionDef, references);
		case ZodFirstPartyTypeKind.ZodVoid:
			return parseZodVoidDef(def as ZodVoidDef, references);
	}
	return { type: "unsupported", path: references.path };
};
