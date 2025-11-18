import type { ParsedRouter, ParsedProcedure } from "@aeolun/trpc-router-parser";
import type { ColorSchemeType } from "@src/react-app/components/CollapsableSection";

export function solidColorBg(type: ColorSchemeType) {
	switch (type) {
		case "mutation":
			return "bg-mutationSolid";
		case "primary":
			return "bg-primarySolid";
		case "query":
			return "bg-querySolid";
		case "router":
			return "bg-routerSolid";
		case "neutral":
			return "bg-neutralSolid";
		case "subscription":
			return "bg-subscriptionSolid";
		case "red":
			return "bg-red-500";
	}
}

export function solidColorBorder(type: ColorSchemeType) {
	switch (type) {
		case "mutation":
			return "border-mutationSolid";
		case "primary":
			return "border-primarySolid";
		case "query":
			return "border-querySolid";
		case "router":
			return "border-routerSolid";
		case "neutral":
			return "border-neutralSolid";
		case "subscription":
			return "border-subscriptionSolid";
		case "red":
			return "border-red-500";
	}
}

export function backgroundColor(type: ColorSchemeType) {
	switch (type) {
		case "mutation":
			return "bg-mutationBg";
		case "primary":
			return "bg-primaryBg";
		case "neutral":
			return "bg-neutralBg";
		case "query":
			return "bg-queryBg";
		case "router":
			return "bg-routerBg";
		case "subscription":
			return "bg-subscriptionBg";
		case "red":
			return "bg-red-100";
	}
}

export function backgroundColorDark(type: ColorSchemeType) {
	switch (type) {
		case "mutation":
			return "bg-mutationBgDark";
		case "primary":
			return "bg-primaryBgDark";
		case "neutral":
			return "bg-neutralBgDark";
		case "query":
			return "bg-queryBgDark";
		case "router":
			return "bg-routerBgDark";
		case "subscription":
			return "bg-subscriptionBgDark";
		case "red":
			return "bg-red-900";
	}
}

export function textColor(type: ColorSchemeType) {
	switch (type) {
		case "mutation":
			return "text-mutationText";
		case "primary":
			return "text-primaryText";
		case "neutral":
			return "text-neutralText";
		case "query":
			return "text-queryText";
		case "router":
			return "text-routerText";
		case "subscription":
			return "text-subscriptionText";
		case "red":
			return "text-red-700";
	}
}

export function colorSchemeForNode(
	node: ParsedRouter | ParsedProcedure,
): ColorSchemeType {
	if (node.nodeType === "router") return "router";
	return node.procedureType;
}
