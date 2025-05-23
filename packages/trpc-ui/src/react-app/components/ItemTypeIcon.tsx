import { type ColorSchemeType } from "@src/react-app/components/CollapsableSection";
import { textColor } from "@src/react-app/components/style-utils";

export function ItemTypeIcon({
	colorScheme,
}: {
	colorScheme: ColorSchemeType;
}) {
	const letter = colorScheme[0]!.toUpperCase();
	return (
		<span className={"font-bold mr-1 " + textColor(colorScheme)}>{letter}</span>
	);
}
