import type { ProcedureExtraData } from "@aeolun/trpc-router-parser";
import { FormLabel } from "@src/react-app/components/form/FormLabel";
import { FormSection } from "@src/react-app/components/form/ProcedureForm/FormSection";
import { type ReactNode } from "react";
import Markdown from "react-markdown";
export function DocumentationSection({
	extraData,
}: {
	extraData: ProcedureExtraData;
}) {
	const hasParams = Object.keys(extraData.parameterDescriptions).length > 0;
	if (!extraData.description && !hasParams) return null;

	return (
		<FormSection title="Docs">
			<div className="space-y-4">
				{extraData.description && (
					<DocumentationSubsection title="Description">
						<article className="prose">
							<Markdown>{extraData.description}</Markdown>
						</article>
					</DocumentationSubsection>
				)}
				{hasParams && (
					<DocumentationSubsection title="Params">
						<table>
							<tbody>
								{Object.entries(extraData.parameterDescriptions).map(
									([key, value]) => (
										<tr
											key={key}
											className="border-b border-separatorLine flex-row space-x-2"
										>
											<td className="text-sm text-neutralText font-bold align-top py-2">
												{`${key}: `}
											</td>
											<td className="pl-4 text-sm text-gray-500 py-2">
												<article className="prose">
													<Markdown className={"prose"}>{value}</Markdown>
												</article>
											</td>
										</tr>
									),
								)}
							</tbody>
						</table>
					</DocumentationSubsection>
				)}
			</div>
		</FormSection>
	);
}

function DocumentationSubsection({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<div className="flex flex-col space-y-2">
			<FormLabel>{title}</FormLabel>
			<span className="text-sm text-gray-500">{children}</span>
		</div>
	);
}
