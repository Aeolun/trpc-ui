import { trpc } from "@src/react-app/trpc";
import type { ParsedProcedure } from "@aeolun/trpc-router-parser";
import { useMemo } from "react";
import { useHeaders } from "@src/react-app/components/contexts/HeadersContext";

// Define a more specific type for subscription data
export interface SubscriptionData<TData = unknown> {
	data: TData;
	receivedAt: number;
	elapsedMs: number;
}

interface SubscriptionHandlerProps<TInput = unknown, TOutput = unknown> {
	procedure: ParsedProcedure;
	inputData: TInput;
	isEnabled: boolean;
	onData: (data: SubscriptionData<TOutput>) => void;
	onError: (error: Error) => void;
	onComplete: () => void;
}

// SSE Warning component to display when headers are used with SSE
export function SSEWarning() {
	const { getHeaders, subscriptionTransport } = useHeaders();
	const headers = getHeaders();
	const hasHeaders = Object.keys(headers).length > 0;

	if (subscriptionTransport !== "sse") {
		return null;
	}

	if (hasHeaders) {
		return (
			<div className="p-4">
				<div className="mb-4 p-3 bg-warningBg border border-warning border-2 rounded text-warningText dark:bg-warningBgDark dark:border-warningText dark:text-warningBg">
					<p className="text-sm">
						<strong>Warning:</strong> You're using Server-Sent Events with
						custom HTTP headers. Custom headers in SSE requests require a
						polyfill on the client side. Consider using cookies for
						authentication instead for better browser compatibility.
					</p>
				</div>
			</div>
		);
	}

	return null;
}

// WebSocket Warning component to display when headers are used with WebSockets
export function WebSocketWarning() {
	const { getHeaders, subscriptionTransport } = useHeaders();
	const headers = getHeaders();
	const hasHeaders = Object.keys(headers).length > 0;

	if (subscriptionTransport !== "websocket" || !hasHeaders) {
		return null;
	}

	return (
		<div className="p-4">
			<div className="mb-4 p-3 bg-warningBg border border-warning border-2 rounded text-warningText dark:bg-warningBgDark dark:border-warningText dark:text-warningBg">
				<p className="text-sm">
					<strong>Note:</strong> When using WebSockets with tRPC, authentication
					headers are sent as connection parameters in a special message format
					when the connection is established:{" "}
					<code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">
						{"{'method':'connectionParams','data':{...}}"}
					</code>
					. For convenience, tRCP UI will automatically add the headers you've
					defined to these connectionParams.
				</p>
			</div>
		</div>
	);
}

export function SubscriptionHandler<TInput = unknown, TOutput = unknown>({
	procedure,
	inputData,
	isEnabled,
	onData,
	onError,
	onComplete,
}: SubscriptionHandlerProps<TInput, TOutput>) {
	function getProcedure() {
		let cur: typeof trpc | (typeof trpc)[keyof typeof trpc] = trpc;
		for (const p of procedure.pathFromRootRouter) {
			// TODO - Maybe figure out these typings?
			//@ts-ignore
			cur = cur[p as keyof typeof cur];
		}
		return cur;
	}

	const router = getProcedure();
	const subscriptionStartTime = useMemo(() => Date.now(), []);

	// Create a wrapper for onData to add timestamp information
	const handleData = (data: TOutput) => {
		const receivedAt = Date.now();
		const elapsedMs = receivedAt - subscriptionStartTime;
		onData({
			data,
			receivedAt,
			elapsedMs,
		});
	};

	// @ts-ignore - tRPC type inference is complicated here
	const subscription = router.useSubscription(inputData, {
		enabled: isEnabled,
		retry: false,
		onData: handleData,
		onError,
		onComplete,
	});

	// Don't render anything - this is just a logic component
	return null;
}
