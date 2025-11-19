import { CollapsableSection } from "@src/react-app/components/CollapsableSection";
import { ProcedureForm } from "@src/react-app/components/form/ProcedureForm";
import type { ParsedRouter } from "@aeolun/trpc-router-parser";
import cn from "clsx";
import { useFilters, procedureMatchesFilters } from "@src/react-app/components/contexts/FilterContext";
import { routerHasMatchingDescendants } from "@src/react-app/utils/routerFiltering";
import { useMemo } from "react";

export function RouterContainer({
	router,
	name,
}: {
	router: ParsedRouter;
	name?: string;
}) {
	const isRoot = router.path.length === 0;
	const { selectedTags } = useFilters();

	const visibleChildren = useMemo(() => {
		return Object.entries(router.children).filter(([, routerOrProcedure]) => {
			// Filter out procedures that don't match
			if (
				routerOrProcedure.nodeType === "procedure" &&
				!procedureMatchesFilters(
					routerOrProcedure.extraData.tags,
					selectedTags,
				)
			) {
				return false;
			}

			// Filter out routers that have no matching descendants
			if (
				routerOrProcedure.nodeType === "router" &&
				!routerHasMatchingDescendants(routerOrProcedure, selectedTags)
			) {
				return false;
			}

			return true;
		});
	}, [router.children, selectedTags]);

	const hasActiveFilters = selectedTags.size > 0;
	const hasNoResults = visibleChildren.length === 0 && hasActiveFilters;

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
				{hasNoResults && isRoot ? (
					<div className="text-center py-8 text-gray-500">
						No routers match all selected tags
					</div>
				) : (
					visibleChildren.map(([childName, routerOrProcedure]) => (
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
					))
				)}
			</div>
		</CollapsableSection>
	);
}
