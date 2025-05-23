import { TRPCPanelMetaSchema } from "./meta.js";
import { z } from "zod";

const ZodObjectSchema = z.object({});

export function isZodObject(
	obj: unknown,
): obj is z.infer<typeof ZodObjectSchema> {
	return ZodObjectSchema.safeParse(obj).success;
}

const SharedProcedureDefPropertiesSchema = z.object({
	inputs: z.array(z.unknown()),
	meta: TRPCPanelMetaSchema.optional(),
});

const QueryDefSchema = SharedProcedureDefPropertiesSchema.merge(
	z.object({
		type: z.literal("query"),
	}),
);

export function isQueryDef(obj: unknown): obj is QueryDef {
	return QueryDefSchema.safeParse(obj).success;
}

type QueryDef = z.infer<typeof QueryDefSchema>;

const MutationDefSchema = SharedProcedureDefPropertiesSchema.merge(
	z.object({
		type: z.literal("mutation"),
	}),
);

export function isMutationDef(obj: unknown): obj is MutationDef {
	return MutationDefSchema.safeParse(obj).success;
}

export type MutationDef = z.infer<typeof MutationDefSchema>;

const SubscriptionDefSchema = SharedProcedureDefPropertiesSchema.merge(
	z.object({
		type: z.literal("subscription"),
	}),
);

type SubscriptionDef = z.infer<typeof SubscriptionDefSchema>;

export function isSubscriptionDef(obj: unknown): obj is SubscriptionDef {
	return SubscriptionDefSchema.safeParse(obj).success;
}

export const ProcedureDefSchema = QueryDefSchema.or(MutationDefSchema).or(
	SubscriptionDefSchema,
);

export type ProcedureDefSharedProperties = z.infer<
	typeof SharedProcedureDefPropertiesSchema
>;

// Don't export this b/c it's just used to type check, use the is functions
const RouterDefSchema = z.object({
	router: z.literal(true),
});

export type RouterDef = {
	router: true;
	procedures: Record<string, RouterOrProcedure>;
};

export type Router = {
	_def: RouterDef;
} & { [key: string]: Router | Procedure };

const RouterSchema = z.object({
	_def: RouterDefSchema,
});

export function isRouter(obj: unknown): obj is Router {
	return RouterSchema.safeParse(obj).success || !isProcedure(obj);
}

const ProcedureSchema = z.object({
	_def: ProcedureDefSchema,
});

export type Procedure = z.infer<typeof ProcedureSchema>;

export function isProcedure(obj: unknown | (() => unknown)): obj is Procedure {
	if (typeof obj !== "function" || !("_def" in obj)) return false;
	return ProcedureDefSchema.safeParse(obj._def).success;
}

const QuerySchema = z.object({
	_def: QueryDefSchema,
});

export type Query = z.infer<typeof QuerySchema>;

export type RouterOrProcedure = Router | Procedure;
