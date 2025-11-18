import { SendIcon } from "../../icons/SendIcon";
import { Button } from "../../Button";
import { LoadingSpinner } from "./LoadingSpinner";

const colorSchemeToVariant = {
	primary: "bg-primarySolid",
	neutral: "bg-neutralSolid",
	red: "bg-subscriptionSolid",
};

export function ProcedureFormButton({
	text,
	colorScheme,
	loading,
}: {
	text: string;
	colorScheme: keyof typeof colorSchemeToVariant;
	loading: boolean;
}) {
	return (
		<Button
			variant={colorScheme}
			type="submit"
			className={`relative rounded-md self-stretch justify-center ${colorSchemeToVariant[colorScheme]}`}
			disabled={loading}
		>
			<div
				className={`flex flex-row ${loading ? " opacity-0 pointer-events-none" : ""}`}
			>
				{text}
				<SendIcon className="w-5 h-5 ml-2" />
			</div>
			{loading && <LoadingSpinner />}
		</Button>
	);
}
