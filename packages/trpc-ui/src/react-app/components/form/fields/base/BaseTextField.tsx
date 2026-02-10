import { type InputHTMLAttributes, useId, useRef } from "react";
import { useEnableInputGlobalHotkeys } from "@src/react-app/components/contexts/HotKeysContext";
import { FieldError } from "../FieldError";

export function BaseTextField({
	value,
	onChange,
	errorMessage,
	label,
	required,
	inputProps,
	className,
}: {
	value: string;
	onChange: (value: string) => void;
	errorMessage?: string;
	label?: string;
	required?: boolean;
	inputProps?: Omit<
		InputHTMLAttributes<HTMLInputElement>,
		"value" | "onChange"
	>;
	className?: string;
}) {
	const inputRef = useRef<HTMLInputElement | null>(null);
	useEnableInputGlobalHotkeys(inputRef, []);
	const id = useId();
	return (
		<div className={"flex flex-col" + (className ? ` ${className}` : "")}>
			{label && (
				<label htmlFor={id} className="text-neutralSolid text-xs mb-1">
					{label}{required && <span className="text-error">*</span>}
				</label>
			)}
			<input
				ref={inputRef}
				id={id}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={label ? `Enter value for ${label}` : undefined}
				className={
					"border rounded-md p-2 text-base bg-white outline-none" +
					(errorMessage
						? " border-error"
						: " border-panelBorder focus:border-primarySolid")
				}
				{...inputProps}
			/>
			{errorMessage && <FieldError errorMessage={errorMessage} />}
		</div>
	);
}
