import { type Control, useController } from "react-hook-form";
import { useEffect, useState } from "react";
import { BaseTextField } from "./base/BaseTextField";
import type { ParsedInputNode } from "@aeolun/trpc-router-parser";

export function NumberField({
	name,
	control,
	label,
	node: inputNode,
}: {
	name: string;
	label: string;
	control: Control<any>;
	node: ParsedInputNode;
}) {
	const [stringValue, setStringValue] = useState("");

	const { field, fieldState } = useController({
		control,
		name,
	});

	function onChange(value: string) {
		setStringValue(value.replace(/[^\d.-]/g, ""));
	}

	useEffect(() => {
		const parsed = parseFloat(stringValue);
		if (isNaN(parsed)) {
			field.onChange(undefined);
			return;
		}
		field.onChange(parseFloat(stringValue));
	}, [stringValue]);

	return (
		<BaseTextField
			onChange={onChange}
			value={stringValue}
			errorMessage={fieldState.error?.message}
			label={label}
			fieldId={inputNode.path.join(".")}
			inputProps={{ inputMode: "decimal" }}
		/>
	);
}
