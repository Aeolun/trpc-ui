import { ErrorRow } from "./ErrorRow";
import { StackTrace } from "./StackTrace";
import { FormSection } from "./FormSection";
import type { TRPCErrorType } from "./index";

// Check if error is a TRPC error type
function isTrpcError(error: unknown): error is TRPCErrorType {
	return (
		typeof error === "object" &&
		error !== null &&
		"meta" in error &&
		typeof error.meta === "object" &&
		error.meta !== null &&
		"responseJSON" in error.meta &&
		Array.isArray(error.meta.responseJSON) &&
		error.meta.responseJSON.length > 0
	);
}

export function MyError({ error }: { error: unknown }) {
	// Handle TRPC formatted errors
	if (isTrpcError(error)) {
		const json = error.meta.responseJSON[0]?.error.json ?? ({} as any);
		const msg = json.message;
		const code = json.code;
		const data = json.data;
		const messageLength = msg ? msg.length : 0;
		const padTo = Math.max(messageLength, data.code?.length || 0);

		return (
			<FormSection titleClassName="text-error" title="Error">
				{msg && (
					<ErrorRow
						title="Message"
						text={msg + ` (code: ${code})`}
						padTitleTo={padTo}
					/>
				)}
				{data?.code && (
					<ErrorRow title="Code" text={data.code} padTitleTo={padTo} />
				)}
				{data?.httpStatus && (
					<ErrorRow
						title="HTTP Status Code"
						text={data.httpStatus + ""}
						padTitleTo={padTo}
					/>
				)}
				{data?.stack && <StackTrace text={data.stack} />}
			</FormSection>
		);
	}

	// Handle regular errors or unknown error formats
	const genericError = error as Error;
	return (
		<FormSection titleClassName="text-error" title="Error">
			<ErrorRow
				title="Message"
				text={genericError.message || "Unknown error occurred"}
				padTitleTo={20}
			/>
			{genericError.stack && <StackTrace text={genericError.stack} />}
		</FormSection>
	);
}
