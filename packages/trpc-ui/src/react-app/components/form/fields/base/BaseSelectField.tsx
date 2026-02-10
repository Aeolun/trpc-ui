import { useId } from "react";
import { FieldError } from "../FieldError";

export function BaseSelectField({
	value,
	onChange,
	options,
	errorMessage,
	label,
}: {
	value?: string;
	onChange: (value: string | undefined) => void;
	options: string[];
	errorMessage?: string;
	label: string;
}) {
	const id = useId();
	return (
		<div className="flex flex-col w-full">
			<label htmlFor={id} className="text-neutralSolid text-xs mb-1">{label}</label>
			<select
				id={id}
				value={value ?? ""}
				onChange={(e) =>
					onChange(e.target.value === "" ? undefined : e.target.value)
				}
				className={
					"border rounded-md p-2 text-base bg-white outline-none" +
					(errorMessage
						? " border-error"
						: " border-panelBorder focus:border-primarySolid")
				}
			>
				<option value="">{label}</option>
				{options.map((e) => (
					<option key={e} value={e}>
						{e}
					</option>
				))}
			</select>
			{errorMessage && <FieldError errorMessage={errorMessage} />}
		</div>
	);
}
