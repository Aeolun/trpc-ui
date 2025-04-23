import { initTRPC } from "@trpc/server";
import superjson from "superjson";
// purely here to make the types work //shrug
const s = initTRPC.create({
	transformer: superjson,
});
export const emptyRouter = s.router({});
