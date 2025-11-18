import { type KeyboardEvent, useRef, useState } from "react";

export default function JSONTextarea({
	value,
	onChange,
}: {
	value: any;
	onChange: (value: any) => void;
}) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [hasError, setHasError] = useState(false);

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Tab") {
			e.preventDefault();
			const textarea = e.currentTarget;
			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			const value = textarea.value;

			// Find the start and end of the line(s) containing the selection
			const lineStart = value.lastIndexOf("\n", start - 1) + 1;
			const lineEnd = value.indexOf("\n", end);
			const actualLineEnd = lineEnd === -1 ? value.length : lineEnd;

			// Get all the lines in the selection
			const selectedText = value.substring(lineStart, actualLineEnd);
			const lines = selectedText.split("\n");

			if (e.shiftKey) {
				// Shift+Tab: Remove indentation from each line
				const unindentedLines = lines.map((line) =>
					line.startsWith("  ") ? line.substring(2) : line,
				);
				const newText = unindentedLines.join("\n");
				const removed = selectedText.length - newText.length;

				const newValue =
					value.substring(0, lineStart) +
					newText +
					value.substring(actualLineEnd);

				textarea.value = newValue;
				textarea.selectionStart = Math.max(lineStart, start - 2);
				textarea.selectionEnd = end - removed;
				handleChange(newValue);
			} else {
				// Tab: Add indentation to each line
				const indentedLines = lines.map((line) => "  " + line);
				const newText = indentedLines.join("\n");

				const newValue =
					value.substring(0, lineStart) +
					newText +
					value.substring(actualLineEnd);

				textarea.value = newValue;
				textarea.selectionStart = start + 2;
				textarea.selectionEnd = end + (newText.length - selectedText.length);
				handleChange(newValue);
			}
		}
	};

	const handleChange = (textValue: string) => {
		try {
			const parsed = JSON.parse(textValue);
			onChange(parsed);
			setHasError(false);
		} catch (err) {
			setHasError(true);
		}
	};

	const handleFormat = () => {
		if (textareaRef.current) {
			try {
				const parsed = JSON.parse(textareaRef.current.value);
				const formatted = JSON.stringify(parsed, null, 2);
				textareaRef.current.value = formatted;
				onChange(parsed);
				setHasError(false);
			} catch (err) {
				// Can't format invalid JSON
			}
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="flex justify-end">
				<button
					type="button"
					onClick={handleFormat}
					className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
				>
					Format JSON
				</button>
			</div>
			<textarea
				ref={textareaRef}
				defaultValue={JSON.stringify(value, null, 2)}
				onChange={(e) => handleChange(e.target.value)}
				onKeyDown={handleKeyDown}
				className={`w-full min-h-[300px] p-3 font-mono text-sm border rounded focus:outline-none focus:ring-2 ${
					hasError
						? "border-red-300 focus:ring-red-500"
						: "border-gray-300 focus:ring-blue-500"
				}`}
				spellCheck={false}
			/>
			{hasError && (
				<p className="text-sm text-red-600">Invalid JSON</p>
			)}
		</div>
	);
}
