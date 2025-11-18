import { CollapsableSection } from "@src/react-app/components/CollapsableSection";
import { ProcedureForm } from "@src/react-app/components/form/ProcedureForm";
import type { ParsedRouter } from "@aeolun/trpc-router-parser";
import cn from "clsx";
import { useFilters, procedureMatchesFilters } from "@src/react-app/components/contexts/FilterContext";

export function RouterContainer({
	router,
	name,
}: {
	router: ParsedRouter;
	name?: string;
}) {
	const isRoot = router.path.length === 0;
	const { selectedTags } = useFilters();
	return (
		<CollapsableSection
			fullPath={router.path}
			titleElement={
				name && (
					<div>
						<h2 className="font-bold text-lg">{name}</h2>
					</div>
				)
			}
			sectionType="router"
			isRoot={isRoot}
		>
			<div
				className={cn(
					"space-y-3",
					!isRoot && "border-l-grey-400 space-y-1 p-1",
				)}
			>
				{Object.entries(router.children).map(
					([childName, routerOrProcedure]) => {
						// Filter out procedures that don't match
						if (
							routerOrProcedure.nodeType === "procedure" &&
							!procedureMatchesFilters(
								routerOrProcedure.extraData.tags,
								selectedTags,
							)
						) {
							return null;
						}

						return (
							<div key={childName}>
								{routerOrProcedure.nodeType === "router" ? (
									<RouterContainer
										name={childName}
										router={routerOrProcedure}
									/>
								) : (
									<ProcedureForm
										name={childName}
										procedure={routerOrProcedure}
									/>
								)}
							</div>
						);
					},
				)}
			</div>
		</CollapsableSection>
	);
}
