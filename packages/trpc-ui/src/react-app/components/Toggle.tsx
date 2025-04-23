import * as React from "react";

interface ToggleProps {
	isActive: boolean;
	onChange: (isActive: boolean) => void;
	leftLabel?: string;
	rightLabel?: string;
	leftTooltip?: string;
	rightTooltip?: string;
	size?: "sm" | "md" | "lg";
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
}

export function Toggle({
	isActive,
	onChange,
	leftLabel,
	rightLabel,
	leftTooltip,
	rightTooltip,
	size = "md",
	leftIcon,
	rightIcon,
}: ToggleProps) {
	const sizeClasses = {
		sm: "text-xs py-1 px-2",
		md: "text-sm py-2 px-4",
		lg: "text-base py-3 px-6",
	};

	return (
		<div className="flex items-center">
			<button
				type="button"
				onClick={() => onChange(false)}
				className={`
          ${!isActive ? "bg-routerSolid text-white font-semibold" : "bg-gray-200 text-gray-700"} 
          ${sizeClasses[size]} 
          rounded-l-md border border-r-0 border-neutralSolidTransparent flex items-center
        `}
				title={leftTooltip}
			>
				{leftIcon && <span className="mr-1">{leftIcon}</span>}
				{leftLabel}
			</button>
			<button
				type="button"
				onClick={() => onChange(true)}
				className={`
          ${isActive ? "bg-subscriptionSolid text-white font-semibold" : "bg-gray-200 text-gray-700"} 
          ${sizeClasses[size]} 
          rounded-r-md border border-neutralSolidTransparent flex items-center
        `}
				title={rightTooltip}
			>
				{rightIcon && <span className="mr-1">{rightIcon}</span>}
				{rightLabel}
			</button>
		</div>
	);
}
