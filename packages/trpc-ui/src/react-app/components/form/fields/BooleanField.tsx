import { type Control, useController } from "react-hook-form";
import type { ParsedInputNode } from "@aeolun/trpc-router-parser";
import { BaseCheckboxField } from "@src/react-app/components/form/fields/base/BaseCheckboxField";
import { FormLabel } from "@src/react-app/components/form/FormLabel";

export function BooleanField({
	name,
	label,
	control,
	node: _node,
}: {
	name: string;
	label: string;
	control: Control<any>;
	node: ParsedInputNode;
}) {
	const { field, fieldState } = useController({ name, control });
	return (
		<>
			<FormLabel>{label}</FormLabel>
			<BaseCheckboxField
				label={"False"}
				onChange={() => field.onChange(false)}
				value={field.value === false}
			/>
			<BaseCheckboxField
				label={"True"}
				onChange={() => field.onChange(true)}
				value={field.value === true}
				errorMessage={fieldState.error?.message}
			/>
		</>
	);
}
