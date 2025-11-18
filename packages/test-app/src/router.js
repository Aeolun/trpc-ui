"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testRouter = void 0;
const server_1 = require("@trpc/server");
const zod_1 = require("zod");
const server_2 = require("@trpc/server");
const node_events_1 = require("node:events");
const superjson_1 = __importDefault(require("superjson"));
const t = server_1.initTRPC.context().meta().create({
    transformer: superjson_1.default,
    isServer: true,
});
function createContext(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const authHeader = opts.req.headers["authorization"];
        const authorized = authHeader !== undefined && authHeader !== "";
        console.log("Request headers: ");
        console.log(authHeader);
        return {
            authorized: authorized,
        };
    });
}
const PostSchema = zod_1.z.object({
    id: zod_1.z.string(),
    text: zod_1.z.string().min(1),
});
const UserSchema = zod_1.z.object({
    id: zod_1.z.string(),
    username: zod_1.z.string(),
    interests: zod_1.z.string().array(),
});
const IDSchema = zod_1.z.object({
    id: zod_1.z.string(),
});
const fakeData = {
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
    getAllPosts: t.procedure
        .meta({
        role: "admin",
    })
        .query(() => {
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
        .meta({
        role: "user",
    })
        .input(zod_1.z.object({
        text: zod_1.z.string(),
    }))
        .mutation(({ input }) => {
        return {
            id: "aoisdjfoasidjfasodf",
            text: input.text,
        };
    }),
    testSubscription: t.procedure
        .input(zod_1.z.object({
        maxId: zod_1.z.number(),
    }))
        .subscription(function (opts) {
        return __asyncGenerator(this, arguments, function* () {
            var _a;
            const maxIndex = (_a = opts.input.maxId) !== null && _a !== void 0 ? _a : 10;
            let index = 0;
            while (true) {
                const idx = index++;
                yield yield __await({
                    id: idx,
                    message: opts.ctx.authorized
                        ? "Authorized"
                        : "Unauthorized, add a 'authorization' header to your connectionParams",
                });
                if (idx >= maxIndex) {
                    // With this, the subscription will stop and the client will disconnect
                    return yield __await(void 0);
                }
                yield __await(new Promise((resolve) => setTimeout(resolve, 500)));
            }
        });
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
const ee = new node_events_1.EventEmitter();
const subscriptionRouter = t.router({
    onAdd: t.procedure.subscription(function (opts) {
        return __asyncGenerator(this, arguments, function* () {
            var _a, e_1, _b, _c;
            // listen for new events
            const listener = (0, node_events_1.on)(ee, "add", {
                // Passing the AbortSignal from the request automatically cancels the event emitter when the request is aborted
                signal: opts.signal,
            });
            try {
                for (var _d = true, listener_1 = __asyncValues(listener), listener_1_1; listener_1_1 = yield __await(listener_1.next()), _a = listener_1_1.done, !_a; _d = true) {
                    _c = listener_1_1.value;
                    _d = false;
                    const [data] = _c;
                    const post = data;
                    yield yield __await(post);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = listener_1.return)) yield __await(_b.call(listener_1));
                }
                finally { if (e_1) throw e_1.error; }
            }
        });
    }),
    add: t.procedure.input(PostSchema).mutation((_a) => __awaiter(void 0, [_a], void 0, function* ({ input }) {
        const post = Object.assign({}, input); /* [..] add to db */
        ee.emit("add", post);
        return post;
    })),
});
var Fruits;
(function (Fruits) {
    Fruits["Apple"] = "apple";
    Fruits["Banana"] = "banana";
    Fruits["Cherry"] = "cherry";
})(Fruits || (Fruits = {}));
exports.testRouter = t.router({
    userRouter: userRouter,
    postsRouter: postsRouter,
    subscriptionRouter: subscriptionRouter,
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
            .input(zod_1.z.object({ aTextInput: zod_1.z.string() }))
            .query(() => {
            return "It's an input";
        }),
        numberInput: t.procedure
            .input(zod_1.z.object({ aNumberInput: zod_1.z.number() }))
            .query(() => {
            return "It's an input";
        }),
        enumInput: t.procedure
            .input(zod_1.z.object({ aEnumInput: zod_1.z.enum(["One", "Two"]) }))
            .query(() => {
            return "It's an input";
        }),
        nativeEnumInput: t.procedure
            .input(zod_1.z.object({ aNativeEnumInput: zod_1.z.nativeEnum(Fruits) }))
            .query(({ input }) => {
            return { fruit: input.aNativeEnumInput };
        }),
        stringArrayInput: t.procedure
            .input(zod_1.z.object({ aStringArray: zod_1.z.string().array() }))
            .query(() => {
            return "It's an input";
        }),
        objectInput: t.procedure
            .input(zod_1.z.object({
            anObject: zod_1.z.object({
                numberArray: zod_1.z.number().array(),
            }),
        }))
            .query(() => {
            return "It's an input";
        }),
        discriminatedUnionInput: t.procedure
            .input(zod_1.z.object({
            aDiscriminatedUnion: zod_1.z.discriminatedUnion("discriminatedField", [
                zod_1.z.object({
                    discriminatedField: zod_1.z.literal("One"),
                    aFieldThatOnlyShowsWhenValueIsOne: zod_1.z.string(),
                }),
                zod_1.z.object({
                    discriminatedField: zod_1.z.literal("Two"),
                    aFieldThatOnlyShowsWhenValueIsTwo: zod_1.z.object({
                        someTextFieldInAnObject: zod_1.z.string(),
                    }),
                }),
            ]),
        }))
            .query(({ input }) => {
            return "It's an input";
        }),
        emailTextInput: t.procedure
            .input(zod_1.z.object({
            email: zod_1.z.string().email("That's an invalid email (custom message)"),
        }))
            .query(({ input }) => {
            return "It's good";
        }),
        voidInput: t.procedure.input(zod_1.z.void()).query(() => {
            return "yep";
        }),
        any: t.procedure
            .meta({
            description: "This procedure has a zod 'any' input. No input components will display, but you can use the JSON editor in input any arbitrary JSON.",
        })
            .input(zod_1.z.any())
            .query(({ input }) => input),
    }),
    anErrorThrowingRoute: t.procedure
        .input(zod_1.z.object({
        ok: zod_1.z.string(),
    }))
        .query(() => {
        throw new server_2.TRPCError({
            message: "It's pretty bad over here.",
            code: "FORBIDDEN",
        });
    }),
    allInputs: t.procedure
        .input(zod_1.z.object({
        obj: zod_1.z
            .object({
            stringProperty: zod_1.z.string().optional(),
            numberProperty: zod_1.z.number().optional(),
        })
            .describe("An object with two properties."),
        stringMin5: zod_1.z.string().min(5),
        numberMin10: zod_1.z.number().min(10),
        stringOptional: zod_1.z.string().optional(),
        enum: zod_1.z.enum(["One", "Two"]),
        optionalEnum: zod_1.z.enum(["Three", "Four"]).optional(),
        stringArray: zod_1.z.string().array(),
        boolean: zod_1.z.boolean(),
        discriminatedUnion: zod_1.z.discriminatedUnion("disc", [
            zod_1.z.object({
                disc: zod_1.z.literal("one"),
                oneProp: zod_1.z
                    .string()
                    .describe("Selecting one gives you a string input"),
            }),
            zod_1.z
                .object({
                disc: zod_1.z.literal("two"),
                twoProp: zod_1.z
                    .enum(["one", "two"])
                    .describe("Selecting two gives you an enum input"),
            })
                .describe('The "disc" property on the zod discriminated union determines the shape of the rest of the zod validator and inputs.'),
        ]),
    }))
        .query(({ input }) => (Object.assign({}, input))),
    authorizedProcedure: t.procedure
        .meta({
        description: 'This procedure requires an "authorization" header to be set in the request. If it is not set, it will throw an "UNAUTHORIZED" error, and otherwise it will return "Authorized!"',
    })
        .mutation(({ ctx }) => {
        if (!ctx.authorized)
            throw new server_2.TRPCError({ code: "UNAUTHORIZED" });
        return "Authorized!";
    }),
    procedureWithDescription: t.procedure
        .meta({
        description: "# This is a description\n\nIt's a **good** one.\nIt may be overkill in certain situations, but procedures descriptions can render markdown thanks to [react-markdown](https://github.com/remarkjs/react-markdown) and [tailwindcss-typography](https://github.com/tailwindlabs/tailwindcss-typography)\n1. Lists\n2. Are\n3. Supported\n but I *personally* think that [links](https://github.com/aidansunbury/trpc-ui) and images ![Image example](https://private-user-images.githubusercontent.com/64103161/384591987-7dc0e751-d493-4337-ac8d-a1f16924bf48.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MzExNDM3OTMsIm5iZiI6MTczMTE0MzQ5MywicGF0aCI6Ii82NDEwMzE2MS8zODQ1OTE5ODctN2RjMGU3NTEtZDQ5My00MzM3LWFjOGQtYTFmMTY5MjRiZjQ4LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNDExMDklMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjQxMTA5VDA5MTEzM1omWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTE4YmM4OTlkZmYyNmJjOWI5YzgwZDUxOTVlYTBjODlkMTVkMzNlNmJjZDhkZDJiNTRhNzFmNDZhMzllNDc2ZGYmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.FsvDvXo6S7n4uOsi3LMUUOeEhjXq6LF88MlU60gzZ2k)\n are the most useful for documentation purposes",
    })
        .input(zod_1.z.object({
        id: zod_1.z.string().describe("The id of the thing."),
        searchTerm: zod_1.z
            .string()
            .optional()
            .describe("Even term descriptions *can* render basic markdown, but don't get too fancy"),
    }))
        .query(() => {
        return "Was that described well enough?";
    }),
    nonObjectInput: t.procedure
        .meta({
        description: "This input is just a string, not a property on an object.",
    })
        .input(zod_1.z.string())
        .query(({ input }) => {
        return `Your input was ${input}`;
    }),
    combinedInputs: t.procedure
        .meta({
        description: "tRPC ui now supports merged input validators. This use case makes creating composable procedures with middlewares easier. The three properties come from three septate .input() calls which automatically get merged into one zod validator.",
    })
        .input(zod_1.z.object({
        userId: zod_1.z.string(),
    }))
        .input(zod_1.z.object({
        organizationId: zod_1.z.string(),
    }))
        .input(zod_1.z.object({
        postId: zod_1.z.string(),
    }))
        .query(({ input }) => {
        return input;
    }),
});
