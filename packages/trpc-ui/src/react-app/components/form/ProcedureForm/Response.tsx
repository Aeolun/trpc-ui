import { FormSection } from "./FormSection";
import { JsonViewer } from "@textea/json-viewer";
import prettyBytes from "pretty-bytes";
import prettyMs from "pretty-ms";
import getSize from "string-byte-length";
import type { SubscriptionData } from "./SubscriptionHandler";

export function Response({
	data,
	opDuration,
	children,
}: {
	data?: unknown;
	opDuration?: number;
	children?: string | object;
}) {
	// Handle empty data case
	if (data === null && !children) {
		return null;
	}

	if (data === undefined && !children) {
		return (
			<FormSection title="Response">
				<p className="font-mono whitespace-pre-wrap break-words">
					Successful request but no data was returned
				</p>
			</FormSection>
		);
	}

	const contentToShow = data !== undefined ? data : children;

	// Calculate size for regular data
	let sizeValue: number | undefined;
	try {
		sizeValue = contentToShow
			? getSize(JSON.stringify(contentToShow))
			: undefined;
	} catch (e) {
		sizeValue = undefined;
	}

	// Create title with appropriate formatting
	let title = "Response";
	if (sizeValue && opDuration) {
		title = `Response (${prettyBytes(sizeValue)}, ${prettyMs(opDuration)})`;
	} else if (sizeValue) {
		title = `Response (${prettyBytes(sizeValue)})`;
	} else if (opDuration) {
		title = `Response (${prettyMs(opDuration)})`;
	}

	// Handle subscription data array case
	if (
		Array.isArray(contentToShow) &&
		contentToShow.length > 0 &&
		"elapsedMs" in contentToShow[0] &&
		"receivedAt" in contentToShow[0] &&
		"data" in contentToShow[0]
	) {
		// This is an array of SubscriptionData
		const subscriptionItems = contentToShow as Array<SubscriptionData>;
		return (
			<FormSection title={title}>
				<div className="max-h-96 overflow-y-auto">
					{subscriptionItems.map((item, index) => {
						// Calculate time since previous message
						const prevItem = index > 0 ? subscriptionItems[index - 1] : null;
						const prevElapsedMs = prevItem ? prevItem.elapsedMs : 0;
						const timeSincePrevMs = item.elapsedMs - prevElapsedMs;

						// Generate a more unique key than just index
						const uniqueKey = `sub-${index}-${item.receivedAt}`;

						return (
							<div
								key={uniqueKey}
								className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700"
							>
								<div className="text-xs text-neutral-500 mb-1 flex justify-between">
									<span>Update #{index + 1}</span>
									<div className="flex gap-2">
										<span title="Time since subscription started">
											⏱️ {prettyMs(item.elapsedMs)}
										</span>
										{index > 0 && (
											<span title="Time since previous message">
												+{prettyMs(timeSincePrevMs)}
											</span>
										)}
									</div>
								</div>
								<JsonViewer
									rootName={false}
									value={item.data}
									quotesOnKeys={false}
								/>
							</div>
						);
					})}
				</div>
			</FormSection>
		);
	}

	// Handle regular array data (making sure it's not subscription data)
	if (Array.isArray(contentToShow)) {
		// Check if this is a regular array (not from a subscription)
		const isSubscriptionData =
			contentToShow.length > 0 &&
			typeof contentToShow[0] === "object" &&
			contentToShow[0] !== null &&
			"elapsedMs" in contentToShow[0] &&
			"receivedAt" in contentToShow[0] &&
			"data" in contentToShow[0];

		if (!isSubscriptionData) {
			// Regular array data - render without "Update #X" labels
			return (
				<FormSection title={title}>
					<div className="max-h-96 overflow-y-auto">
						<JsonViewer
							rootName={false}
							value={contentToShow}
							quotesOnKeys={false}
						/>
					</div>
				</FormSection>
			);
		}
	}

	// Handle regular object case
	if (typeof contentToShow === "object" && contentToShow !== null) {
		return (
			<FormSection title={title}>
				<JsonViewer
					rootName={false}
					value={contentToShow}
					quotesOnKeys={false}
				/>
			</FormSection>
		);
	}

	// Handle string case
	return (
		<FormSection title={title}>
			<p className="font-mono whitespace-pre-wrap break-words">
				{String(contentToShow)}
			</p>
		</FormSection>
	);
}
