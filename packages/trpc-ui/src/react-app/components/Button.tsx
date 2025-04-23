import type { ButtonHTMLAttributes } from "react";
import type { ColorSchemeType } from "@src/react-app/components/CollapsableSection";
import { solidColorBg } from "@src/react-app/components/style-utils";

export function Button({
	variant,
	...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant: ColorSchemeType }) {
	return (
		<button
			{...props}
			className={`p-2 text-white rounded-md text-base flex flex-row items-center self-end border-2 border-transparent focus:border-yellow-500 ${props.className} ${solidColorBg(variant)}`}
		/>
	);
}
