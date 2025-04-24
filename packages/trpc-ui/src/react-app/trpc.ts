import { createTRPCReact } from "@trpc/react-query";
import {
	httpBatchLink,
	createWSClient,
	wsLink,
	splitLink,
	httpSubscriptionLink,
} from "@trpc/client";
import type { emptyRouter } from "./trpc-empty-server";
import { EventSourcePolyfill } from "event-source-polyfill";
import superjson from "superjson";
import type { EventSourceLike } from "@trpc/server/unstable-core-do-not-import";

// Create a function that generates the links configuration based on URL and headers
export function createLinks(options: {
	url: string;
	wsUrl?: string;
	getHeaders: () => Record<string, string>;
	subscriptionTransport?: "websocket" | "sse";
	transformer?: "superjson";
}) {
	// Create websocket client (only needed if using WebSocket transport)
	const wsClient =
		options.subscriptionTransport !== "sse"
			? createWSClient({
					url: options.wsUrl ?? options.url.replace(/^http/, "ws"),
					connectionParams: () => {
						console.log("connectionParams", options.getHeaders());
						return options.getHeaders();
					},
				})
			: null;

	// Determine which subscription link to use based on options
	const subscriptionLink =
		options.subscriptionTransport === "sse"
			? httpSubscriptionLink<
					typeof emptyRouter,
					EventSourceLike.AnyConstructor
				>({
					url: options.url,
					// Use the global EventSource or a polyfill if needed
					EventSource: EventSourcePolyfill,
					eventSourceOptions: () => ({
						withCredentials: true, // Allow cookies for CORS if needed
						headers: options.getHeaders(),
					}),
					// @ts-expect-error: don't know if we want to work with a superjson transformer, and I don't want to make two separate code paths for with and without
					transformer:
						options.transformer === "superjson" ? superjson : undefined,
				})
			: wsClient
				? wsLink<typeof emptyRouter>({
						client: wsClient,

						transformer: superjson,
					})
				: undefined;

	if (!subscriptionLink) {
		throw new Error("Subscription link is undefined");
	}

	return [
		// Use splitLink to route each operation to the appropriate link
		splitLink({
			// Check if the operation is a subscription
			condition: (op) => op.type === "subscription",
			// Use the appropriate subscription link
			true: subscriptionLink,
			// If it's not a subscription (query/mutation), use HTTP
			false: httpBatchLink<typeof emptyRouter>({
				url: options.url,
				headers: options.getHeaders,
				// @ts-expect-error: don't know if we want to work with a superjson transformer, and I don't want to make two separate code paths for with and without
				transformer:
					options.transformer === "superjson" ? superjson : undefined,
			}),
		}),
	];
}

// Create the React client
export const trpc = createTRPCReact<typeof emptyRouter>();
