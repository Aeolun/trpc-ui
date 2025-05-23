import { initTRPC } from "@trpc/server";
import { z } from "zod";

import * as trpcExpress from "@trpc/server/adapters/express";
import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { EventEmitter } from "node:events";
import superjson from "superjson";

type TRPCMeta = Record<string, unknown>;
type Meta<TMeta = TRPCMeta> = TMeta & {
	description?: string;
	cool?: string;
};
const t = initTRPC.context<ContextType>().meta<Meta>().create({
	transformer: superjson,
	isServer: true,
});

async function createContext(opts: trpcExpress.CreateExpressContextOptions) {
	const authHeader = opts.req.headers["authorization"];
	const authorized = authHeader !== undefined && authHeader !== "";
	console.log("Request headers: ");
	console.log(authHeader);
	return {
		authorized: authorized,
	};
}

type ContextType = Awaited<ReturnType<typeof createContext>>;

const PostSchema = z.object({
	id: z.string().uuid(),
	text: z.string().min(1),
});

type Post = z.infer<typeof PostSchema>;

const UserSchema = z.object({
	id: z.string(),
	username: z.string(),
	interests: z.string().array(),
});

type User = z.infer<typeof UserSchema>;

const IDSchema = z.object({
	id: z.string(),
});

const fakeData: {
	user: User;
} = {
	user: {
		id: "f43cb448-1194-4528-80c7-b6f9287ad5fa",
		username: "trpclover47",
		interests: [
			"type safety",
			"using 'as any'",
			"mindfulness meditation",
			"mcu movies",
		],
	},
};

const userRouter = t.router({
	getUserById: t.procedure.input(IDSchema).query((old) => {
		return fakeData.user;
	}),
	updateUser: t.procedure.input(UserSchema).mutation(({ input }) => {
		return input;
	}),
	deleteUser: t.procedure.input(IDSchema).mutation(() => {
		return {
			message: "User deleted (not really)",
		};
	}),
	getAllUsers: t.procedure.query(() => {
		return [fakeData.user, fakeData.user, fakeData.user, fakeData.user];
	}),
});

const postsRouter = t.router({
	getAllPosts: t.procedure.query(() => {
		return [
			{
				id: "asodifjaosdf",
				text: "Post Id",
			},
			{
				id: "asodifjaosdf",
				text: "Post Id",
			},
			{
				id: "asodifjaosdf",
				text: "Post Id",
			},
		];
	}),
	createPost: t.procedure
		.input(
			z.object({
				text: z.string(),
			}),
		)
		.mutation(({ input }) => {
			return {
				id: "aoisdjfoasidjfasodf",
				text: input.text,
			};
		}),

	testSubscription: t.procedure
		.input(
			z.object({
				maxId: z.number(),
			}),
		)
		.subscription(async function* (opts) {
			const maxIndex = opts.input.maxId ?? 10;
			let index = 0;
			while (true) {
				const idx = index++;
				yield {
					id: idx,
					message: opts.ctx.authorized
						? "Authorized"
						: "Unauthorized, add a 'authorization' header to your connectionParams",
				};
				if (idx >= maxIndex) {
					// With this, the subscription will stop and the client will disconnect
					return;
				}
				await new Promise((resolve) => setTimeout(resolve, 500));
			}
		}),
});

const utilityRouter = t.router({
	getUsState: t.procedure.query(() => {
		return [
			{
				stateCode: "NY",
				stateName: "New York",
				stateId: 0,
			},
		];
	}),
});
utilityRouter._def.procedures.getUsState._def.meta;

const multiRouter = {
	userRouter,
	postsRouter,
	utilityRouter,
};

// TODO unimplemented
const ee = new EventEmitter();
const subscriptionRouter = t.router({
	onAdd: t.procedure.subscription(() => {
		// `resolve()` is triggered for each client when they start subscribing `onAdd`
		// return an `observable` with a callback which is triggered immediately
		return observable<Post>((emit) => {
			const onAdd = (data: Post) => {
				// emit data to client
				emit.next(data);
			};
			// trigger `onAdd()` when `add` is triggered in our event emitter
			ee.on("add", onAdd);
			// unsubscribe function when client disconnects or stops subscribing
			return () => {
				ee.off("add", onAdd);
			};
		});
	}),
	add: t.procedure.input(PostSchema).mutation(async ({ input }) => {
		const post = { ...input }; /* [..] add to db */
		ee.emit("add", post);
		return post;
	}),
});

enum Fruits {
	Apple = "apple",
	Banana = "banana",
	Cherry = "cherry",
}

export const testRouter = t.router({
	userRouter: userRouter,
	postsRouter: postsRouter,
	utilityRouter: utilityRouter,
	nestedRouters: t.router(multiRouter),
	deeplyNestedRouter: t.router({
		levelOne: t.router({
			levelTwo: t.router({
				levelThree: t.router(multiRouter),
			}),
		}),
	}),
	inputShowcaseRouter: t.router({
		textInput: t.procedure
			.input(z.object({ aTextInput: z.string() }))
			.query(() => {
				return "It's an input";
			}),
		numberInput: t.procedure
			.input(z.object({ aNumberInput: z.number() }))
			.query(() => {
				return "It's an input";
			}),
		enumInput: t.procedure
			.input(z.object({ aEnumInput: z.enum(["One", "Two"]) }))
			.query(() => {
				return "It's an input";
			}),
		nativeEnumInput: t.procedure
			.input(z.object({ aNativeEnumInput: z.nativeEnum(Fruits) }))
			.query(({ input }) => {
				return { fruit: input.aNativeEnumInput };
			}),
		stringArrayInput: t.procedure
			.input(z.object({ aStringArray: z.string().array() }))
			.query(() => {
				return "It's an input";
			}),
		objectInput: t.procedure
			.input(
				z.object({
					anObject: z.object({
						numberArray: z.number().array(),
					}),
				}),
			)
			.query(() => {
				return "It's an input";
			}),
		discriminatedUnionInput: t.procedure
			.input(
				z.object({
					aDiscriminatedUnion: z.discriminatedUnion("discriminatedField", [
						z.object({
							discriminatedField: z.literal("One"),
							aFieldThatOnlyShowsWhenValueIsOne: z.string(),
						}),
						z.object({
							discriminatedField: z.literal("Two"),
							aFieldThatOnlyShowsWhenValueIsTwo: z.object({
								someTextFieldInAnObject: z.string(),
							}),
						}),
					]),
				}),
			)
			.query(({ input }) => {
				return "It's an input";
			}),
		emailTextInput: t.procedure
			.input(
				z.object({
					email: z.string().email("That's an invalid email (custom message)"),
				}),
			)
			.query(({ input }) => {
				return "It's good";
			}),
		voidInput: t.procedure.input(z.void()).query(() => {
			return "yep";
		}),
		any: t.procedure
			.meta({
				description:
					"This procedure has a zod 'any' input. No input components will display, but you can use the JSON editor in input any arbitrary JSON.",
			})
			.input(z.any())
			.query(({ input }) => input),
	}),

	anErrorThrowingRoute: t.procedure
		.input(
			z.object({
				ok: z.string(),
			}),
		)
		.query(() => {
			throw new TRPCError({
				message: "It's pretty bad over here.",
				code: "FORBIDDEN",
			});
		}),
	allInputs: t.procedure
		.input(
			z.object({
				obj: z
					.object({
						stringProperty: z.string().optional(),
						numberProperty: z.number().optional(),
					})
					.describe("An object with two properties."),
				stringMin5: z.string().min(5),
				numberMin10: z.number().min(10),
				stringOptional: z.string().optional(),
				enum: z.enum(["One", "Two"]),
				optionalEnum: z.enum(["Three", "Four"]).optional(),
				stringArray: z.string().array(),
				boolean: z.boolean(),
				discriminatedUnion: z.discriminatedUnion("disc", [
					z.object({
						disc: z.literal("one"),
						oneProp: z
							.string()
							.describe("Selecting one gives you a string input"),
					}),
					z
						.object({
							disc: z.literal("two"),
							twoProp: z
								.enum(["one", "two"])
								.describe("Selecting two gives you an enum input"),
						})
						.describe(
							'The "disc" property on the zod discriminated union determines the shape of the rest of the zod validator and inputs.',
						),
				]),
			}),
		)
		.query(({ input }) => ({ ...input })),
	authorizedProcedure: t.procedure
		.meta({
			description:
				'This procedure requires an "authorization" header to be set in the request. If it is not set, it will throw an "UNAUTHORIZED" error, and otherwise it will return "Authorized!"',
		})
		.mutation(({ ctx }) => {
			if (!ctx.authorized) throw new TRPCError({ code: "UNAUTHORIZED" });
			return "Authorized!";
		}),
	procedureWithDescription: t.procedure
		.meta({
			description:
				"# This is a description\n\nIt's a **good** one.\nIt may be overkill in certain situations, but procedures descriptions can render markdown thanks to [react-markdown](https://github.com/remarkjs/react-markdown) and [tailwindcss-typography](https://github.com/tailwindlabs/tailwindcss-typography)\n1. Lists\n2. Are\n3. Supported\n but I *personally* think that [links](https://github.com/aidansunbury/trpc-ui) and images ![Image example](https://private-user-images.githubusercontent.com/64103161/384591987-7dc0e751-d493-4337-ac8d-a1f16924bf48.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MzExNDM3OTMsIm5iZiI6MTczMTE0MzQ5MywicGF0aCI6Ii82NDEwMzE2MS8zODQ1OTE5ODctN2RjMGU3NTEtZDQ5My00MzM3LWFjOGQtYTFmMTY5MjRiZjQ4LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNDExMDklMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjQxMTA5VDA5MTEzM1omWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTE4YmM4OTlkZmYyNmJjOWI5YzgwZDUxOTVlYTBjODlkMTVkMzNlNmJjZDhkZDJiNTRhNzFmNDZhMzllNDc2ZGYmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.FsvDvXo6S7n4uOsi3LMUUOeEhjXq6LF88MlU60gzZ2k)\n are the most useful for documentation purposes",
		})
		.input(
			z.object({
				id: z.string().describe("The id of the thing."),
				searchTerm: z
					.string()
					.optional()
					.describe(
						"Even term descriptions *can* render basic markdown, but don't get too fancy",
					),
			}),
		)
		.query(() => {
			return "Was that described well enough?";
		}),
	nonObjectInput: t.procedure
		.meta({
			description: "This input is just a string, not a property on an object.",
		})
		.input(z.string())
		.query(({ input }) => {
			return `Your input was ${input}`;
		}),
	combinedInputs: t.procedure
		.meta({
			description:
				"tRPC ui now supports merged input validators. This use case makes creating composable procedures with middlewares easier. The three properties come from three septate .input() calls which automatically get merged into one zod validator.",
		})
		.input(
			z.object({
				userId: z.string(),
			}),
		)
		.input(
			z.object({
				organizationId: z.string(),
			}),
		)
		.input(
			z.object({
				postId: z.string(),
			}),
		)
		.query(({ input }) => {
			return input;
		}),
});
