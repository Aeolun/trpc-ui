import { useCallback } from "react";
import type { ParsedRouter, ParsedProcedure } from "@aeolun/trpc-router-parser";
import {
	collapsables,
	useCollapsableIsShowing,
	useSiteNavigationContext,
} from "@src/react-app/components/contexts/SiteNavigationContext";
import { Chevron } from "@src/react-app/components/Chevron";
import { colorSchemeForNode } from "@src/react-app/components/style-utils";
import { ItemTypeIcon } from "@src/react-app/components/ItemTypeIcon";
import { collectAllTags } from "@src/react-app/utils/collectTags";
import { useFilters } from "@src/react-app/components/contexts/FilterContext";
export function SideNav({
	rootRouter,
	open,
}: // setOpen,
{
	open: boolean;
	rootRouter: ParsedRouter;
	setOpen: (value: boolean) => void;
}) {
	const allTags = collectAllTags(rootRouter);
	const { toggleTag, isTagSelected, clearFilters, selectedTags } = useFilters();

	return open ? (
		<div
			style={{ maxHeight: "calc(100vh - 4rem)" }}
			className="min-w-[16rem] overflow-scroll shadow-sm flex-col flex items-start p-2 pr-4 space-y-2 bg-actuallyWhite border-r-2 border-r-panelBorder"
		>
			{allTags.length > 0 && (
				<div className="w-full pb-2 border-b border-gray-200">
					<div className="flex justify-between items-center mb-2">
						<span className="text-xs font-semibold text-gray-600 uppercase">
							Filters
						</span>
						{selectedTags.size > 0 && (
							<button
								onClick={clearFilters}
								className="text-xs text-blue-600 hover:text-blue-800"
							>
								Clear
							</button>
						)}
					</div>
					<div className="flex flex-wrap gap-1">
						{allTags.map((tag) => {
							const selected = isTagSelected(tag.text);
							return (
								<button
									key={tag.text}
									onClick={() => toggleTag(tag.text)}
									className={`px-2 py-0.5 text-xs font-semibold rounded text-white transition-opacity hover:opacity-80 ${
										selected ? "opacity-100" : "opacity-60"
									}`}
									style={{
										backgroundColor: tag.color,
									}}
								>
									{tag.text}
								</button>
							);
						})}
					</div>
				</div>
			)}
			<SideNavItem node={rootRouter} path={[]} />
		</div>
	) : null;
}

function SideNavItem({
	node,
	path,
}: {
	node: ParsedRouter | ParsedProcedure;
	path: string[];
}) {
	const { markForScrollTo } = useSiteNavigationContext();
	const shown = useCollapsableIsShowing(path) || path.length === 0;

	const onClick = useCallback(function onClick() {
		collapsables.toggle(path);
		markForScrollTo(path);
	}, []);

	return (
		<>
			{path.length > 0 && (
				<button
					className={`font-bold flex flex-row items-center justify-between w-full ${
						shown ? "" : "opacity-70"
					}`}
					onClick={onClick}
				>
					<span className="flex flex-row items-start">
						<ItemTypeIcon colorScheme={colorSchemeForNode(node)} />
						{path[path.length - 1]}
					</span>

					{node.nodeType === "router" ? (
						<Chevron
							className={"ml-2 w-3 h-3 " + ``}
							direction={shown ? "down" : "right"}
						/>
					) : (
						<div />
					)}
				</button>
			)}
			{shown && node.nodeType === "router" && (
				<div className="pl-2 flex flex-col items-start space-y-2 self-stretch">
					{Object.entries(node.children).map(([key, node]) => {
						return (
							<SideNavItem
								path={
									node.nodeType === "procedure"
										? node.pathFromRootRouter
										: node.path
								}
								node={node}
								key={key}
							/>
						);
					})}
				</div>
			)}
		</>
	);
}
