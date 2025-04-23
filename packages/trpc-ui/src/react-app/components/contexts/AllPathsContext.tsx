import { useContext } from "react";
import type { ParsedProcedure, ParsedRouter } from "@aeolun/trpc-router-parser";
import { createContext, type ReactNode, useMemo } from "react";
import type { ColorSchemeType } from "@src/react-app/components/CollapsableSection.js";
import { colorSchemeForNode } from "@src/react-app/components/style-utils";

const Context = createContext<{
	pathsArray: string[];
	colorSchemeForNode: { [path: string]: ColorSchemeType };
} | null>(null);

function flatten(
	node: ParsedRouter | ParsedProcedure,
): [string, ColorSchemeType][] {
	const r: [string, ColorSchemeType][] = [];
	const colorSchemeType = colorSchemeForNode(node);
	if (node.nodeType === "router") {
		const o = Object.values(node.children)
			.map(flatten)
			.reduce((a, b) => {
				a.push(...b);
				return a;
			}, []);
		return [...r, ...o, [node.path.join("."), colorSchemeType]];
	}

	return [...r, [node.pathFromRootRouter.join("."), colorSchemeType]];
}

export function AllPathsContextProvider({
	rootRouter,
	children,
}: {
	rootRouter: ParsedRouter;
	children: ReactNode;
}) {
	const flattened = useMemo(() => flatten(rootRouter), [rootRouter]);
	const pathsArray = useMemo(() => {
		return flattened.map((e) => e[0]);
	}, [flattened]);
	const colorSchemeForNode = useMemo(
		() => Object.fromEntries(flattened),
		[flattened],
	);
	return (
		<Context.Provider
			value={{
				pathsArray,
				colorSchemeForNode,
			}}
		>
			{children}
		</Context.Provider>
	);
}

export function useAllPaths() {
	const ctx = useContext(Context);
	if (ctx === null) throw new Error("AllPathsContextProvider not found.");
	return ctx;
}
