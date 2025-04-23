import { useEffect, useRef, useState } from "react";
import { type Control, useForm, useFormState } from "react-hook-form";
import type { ParsedProcedure } from "@aeolun/trpc-router-parser";
import { ajvResolver } from "@hookform/resolvers/ajv";
import { defaultFormValuesForNode } from "@src/react-app/components/form/utils";
import { trpc } from "@src/react-app/trpc";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { z } from "zod";
import { ProcedureFormButton } from "./ProcedureFormButton";
import { Response } from "./Response";
import { FormSection } from "./FormSection";
import { MyError } from "./Error";
import { CollapsableSection } from "@src/react-app/components/CollapsableSection";
import { CloseIcon } from "@src/react-app/components/icons/CloseIcon";
import { ToggleJsonIcon } from "@src/react-app/components/icons/ToggleJsonIcon";
import { ObjectField } from "@src/react-app/components/form/fields/ObjectField";
import { fullFormats } from "ajv-formats/dist/formats";
import type { ParsedInputNode } from "@aeolun/trpc-router-parser";
import { DocumentationSection } from "@src/react-app/components/form/ProcedureForm/DescriptionSection";
import { Field } from "@src/react-app/components/form/Field";
import { ProcedureFormContextProvider } from "@src/react-app/components/form/ProcedureForm/ProcedureFormContext";
import JSONEditor from "../JSONEditor";
import {
	SubscriptionHandler,
	type SubscriptionData,
	SSEWarning,
	WebSocketWarning,
} from "./SubscriptionHandler";

const TRPCErrorSchema = z.object({
	meta: z.object({
		responseJSON: z
			.array(
				z.object({
					error: z.object({
						json: z.object({
							code: z.number(),
							data: z.object({
								code: z.string(),
								httpStatus: z.number(),
								stack: z.string().optional(),
							}),
							message: z.string().optional(),
						}),
					}),
				}),
			)
			.min(1),
	}),
});

export type TRPCErrorType = z.infer<typeof TRPCErrorSchema>;

export const ROOT_VALS_PROPERTY_NAME = "vals";

export function ProcedureForm({
	procedure,
	name,
}: {
	procedure: ParsedProcedure;
	name: string;
}) {
	// null => request was never sent
	// undefined => request successful but nothing returned from procedure
	const [mutationResponse, setMutationResponse] = useState<unknown>(null);
	const [queryEnabled, setQueryEnabled] = useState<boolean>(false);
	const [queryInput, setQueryInput] = useState<Record<string, unknown> | null>(
		null,
	);
	const formRef = useRef<HTMLFormElement | null>(null);
	const context = trpc.useContext();
	const [startTime, setStartTime] = useState<number | undefined>();
	const [opDuration, setOpDuration] = useState<number | undefined>();
	// For subscription data
	const [subscriptionData, setSubscriptionData] = useState<SubscriptionData[]>(
		[],
	);
	const [isSubscribed, setIsSubscribed] = useState(false);
	// Store subscription input data
	const [subscriptionInputData, setSubscriptionInputData] = useState<Record<
		string,
		unknown
	> | null>(null);

	function getProcedure() {
		let cur: typeof trpc | (typeof trpc)[keyof typeof trpc] = trpc;
		for (const p of procedure.pathFromRootRouter) {
			// TODO - Maybe figure out these typings?
			//@ts-ignore
			cur = cur[p as keyof typeof cur];
		}
		return cur;
	}

	const query = (() => {
		const router = getProcedure();
		//@ts-ignore
		return router.useQuery(queryInput, {
			enabled: queryEnabled,
			initialData: null,
			retry: false,
			refetchOnWindowFocus: false,
		});
	})() as UseQueryResult<unknown>;

	function invalidateQuery(input: unknown) {
		let cur: typeof context | (typeof context)[keyof typeof context] = context;
		for (const p of procedure.pathFromRootRouter) {
			//@ts-ignore
			cur = cur[p as keyof typeof cur];
		}
		//@ts-ignore
		cur.invalidate(input);
	}

	const mutation = (() => {
		const router = getProcedure();
		//@ts-ignore
		return router.useMutation({
			retry: false,
			onSuccess: () => {
				if (startTime) setOpDuration(Date.now() - startTime);
				setStartTime(undefined);
			},
		});
	})() as UseMutationResult<unknown>;

	const {
		control,
		reset: resetForm,
		handleSubmit,
		getValues,
		setValue,
	} = useForm({
		// @ts-expect-error: dunno what is wrong here, need to fix but don't feel like it now.
		resolver: ajvResolver(wrapJsonSchema(procedure.inputSchema as unknown), {
			formats: fullFormats,
		}),
		defaultValues: {
			[ROOT_VALS_PROPERTY_NAME]: defaultFormValuesForNode(procedure.node),
		},
	});

	function onSubmit(data: { [ROOT_VALS_PROPERTY_NAME]: any }) {
		// Get the raw input values
		const inputData = data[ROOT_VALS_PROPERTY_NAME];
		console.log(
			"procedure type",
			procedure.procedureType,
			"name",
			name,
			"input data",
			inputData,
		);

		if (procedure.procedureType === "subscription") {
			// Toggle subscription status
			if (isSubscribed) {
				setIsSubscribed(false);
				setSubscriptionData([]);
				return;
			}

			setStartTime(Date.now());
			setIsSubscribed(true);
			setSubscriptionData([]);
			setSubscriptionInputData(inputData);
		} else if (procedure.procedureType === "query") {
			// For queries, we follow the original approach
			setStartTime(Date.now());
			setQueryInput(inputData);
			setQueryEnabled(true);
			invalidateQuery(inputData);
		} else {
			// For mutations, we follow the original approach
			setStartTime(Date.now());
			mutation.mutateAsync(inputData).then(setMutationResponse).catch();
		}
	}

	// Subscription event handlers
	const handleSubscriptionData = (data: SubscriptionData) => {
		if (procedure.procedureType === "subscription") {
			setSubscriptionData((prev) => [...prev, data]);
		}
		if (startTime) setOpDuration(Date.now() - startTime);
	};

	const handleSubscriptionError = (error: Error) => {
		console.error("Subscription error:", error);
		setIsSubscribed(false);
	};

	const handleSubscriptionComplete = () => {
		console.log("Subscription completed");
		setIsSubscribed(false);
	};

	// I've seen stuff online saying form reset should happen in useEffect hook only
	// not really sure though, gonna just leave it for now
	const [shouldReset, setShouldReset] = useState(false);
	useEffect(() => {
		if (shouldReset) {
			resetForm(
				{ [ROOT_VALS_PROPERTY_NAME]: defaultFormValuesForNode(procedure.node) },
				{
					keepValues: false,
					keepDirtyValues: false,
					keepDefaultValues: false,
				},
			);
			setShouldReset(false);
		}
	}, [shouldReset, resetForm, procedure.node]);

	function reset() {
		setShouldReset(true);
		setQueryEnabled(false);
		setIsSubscribed(false);
		setSubscriptionData([]);
	}

	// Determine which data to show
	const data = (() => {
		if (procedure.procedureType === "subscription") {
			return subscriptionData.length > 0 ? subscriptionData : null;
		}
		if (procedure.procedureType === "query") {
			return query.data ?? null;
		}
		return mutationResponse;
	})();

	const error =
		procedure.procedureType === "query" ? query.error : mutation.error;

	// Fixes the timing for queries, not ideal but works
	useEffect(() => {
		if (query.fetchStatus === "fetching") {
			setStartTime(Date.now());
		}
		if (query.fetchStatus === "idle" && startTime) {
			setOpDuration(Date.now() - startTime);
		}
	}, [query.fetchStatus, startTime]);

	const fieldName = procedure.node.path.join(".");

	const [useRawInput, setUseRawInput] = useState(false);
	function toggleRawInput() {
		console.log(getValues());
		setUseRawInput(!useRawInput);
	}

	return (
		<ProcedureFormContextProvider path={procedure.pathFromRootRouter.join(".")}>
			{/* Add the SubscriptionHandler only when needed */}
			{procedure.procedureType === "subscription" && isSubscribed && (
				<SubscriptionHandler
					procedure={procedure}
					inputData={subscriptionInputData}
					isEnabled={isSubscribed}
					onData={handleSubscriptionData}
					onError={handleSubscriptionError}
					onComplete={handleSubscriptionComplete}
				/>
			)}
			<CollapsableSection
				titleElement={
					<span className="font-bold text-lg flex flex-row items-center">
						{name}
					</span>
				}
				fullPath={procedure.pathFromRootRouter}
				sectionType={procedure.procedureType}
				focusOnScrollRef={formRef}
			>
				<form
					className="flex flex-col space-y-4"
					onSubmit={handleSubmit(onSubmit)}
					ref={formRef}
				>
					<div className="flex flex-col">
						<DocumentationSection extraData={procedure.extraData} />

						{/* Display appropriate warning based on subscription type */}
						{procedure.procedureType === "subscription" && <SSEWarning />}
						{procedure.procedureType === "subscription" && <WebSocketWarning />}

						<FormSection
							title="Input"
							topRightElement={
								<div className="flex">
									<XButton control={control} reset={reset} />
									<ToggleRawInput onClick={toggleRawInput} />
								</div>
							}
						>
							{useRawInput && (
								<JSONEditor
									value={getValues().vals}
									onChange={(values) => {
										setValue("vals", values);
									}}
								/>
							)}
							{!useRawInput &&
								(procedure.node.type === "object" ? (
									Object.keys(procedure.node.children).length > 0 && (
										<ObjectField
											node={
												procedure.node as ParsedInputNode & {
													type: "object";
												}
											}
											label={fieldName}
											control={control}
											topLevel
										/>
									)
								) : (
									<Field inputNode={procedure.node} control={control} />
								))}

							<ProcedureFormButton
								text={
									procedure.procedureType === "subscription" && isSubscribed
										? `Unsubscribe from ${name}`
										: `Execute ${name}`
								}
								colorScheme={isSubscribed ? "red" : "neutral"}
								loading={query.fetchStatus === "fetching" || mutation.isPending}
							/>
						</FormSection>

						<FormSection title="Response">
							{procedure.procedureType === "subscription" &&
								subscriptionData.length > 0 && (
									<div className="mb-4">
										<p className="mb-2 text-sm text-neutral-600 dark:text-neutral-400">
											Received {subscriptionData.length} updates
										</p>
									</div>
								)}
							{!error && <Response data={data} opDuration={opDuration} />}
							{error && <MyError error={error} />}
						</FormSection>
					</div>
				</form>
			</CollapsableSection>
		</ProcedureFormContextProvider>
	);
}

function XButton({
	control,
	reset,
}: {
	control: Control<any>;
	reset: () => void;
}) {
	const { isDirty } = useFormState({ control: control });

	function onClickClear() {
		reset();
	}

	return (
		<div className="w-6 h-6">
			{isDirty && (
				<button type="button" onClick={onClickClear}>
					<CloseIcon className="w-6 h-6" />
				</button>
			)}
		</div>
	);
}

function ToggleRawInput({ onClick }: { onClick: () => void }) {
	return (
		<div className="w-6 h-6">
			<button type="button" onClick={onClick}>
				<ToggleJsonIcon className="w-6 h-6" />
			</button>
		</div>
	);
}

function wrapJsonSchema(jsonSchema: unknown) {
	if (jsonSchema && typeof jsonSchema === "object" && "$schema" in jsonSchema) {
		// biome-ignore lint/performance/noDelete: needed to remove $schema
		delete jsonSchema.$schema;
	}

	return {
		type: ["object"],
		properties: {
			[ROOT_VALS_PROPERTY_NAME]: jsonSchema,
		},
		required: [],
		additionalProperties: false,
		$schema: "http://json-schema.org/draft-07/schema#",
	};
}
