import type { AnyTRPCRouter } from "@trpc/server";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import {
	parseRouterWithOptions,
	type TrpcPanelExtraOptions,
} from "@aeolun/trpc-router-parser";

export type RenderOptions = {
	url: string;
	cache?: boolean;
	subscriptionTransport?: "websocket" | "sse";
} & TrpcPanelExtraOptions;

const defaultParseRouterOptions: Partial<TrpcPanelExtraOptions> = {
	logFailedProcedureParse: false,
	transformer: "superjson",
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const javascriptReplaceSymbol = "{{js}}";
const cssReplaceSymbol = "{{css}}";
const routerReplaceSymbol = '"{{parsed_router}}"';
const optionsReplaceSymbol = '"{{options}}"';
const bundlePath = `${__dirname}/react-app/bundle.js`;
const indexPath = `${__dirname}/react-app/index.html`;
const cssPath = `${__dirname}/react-app/index.css`;

type InjectionParam = {
	searchFor: string;
	injectString: string;
};

function injectParams(string: string, injectionParams: InjectionParam[]) {
	let r = string;
	for (const param of injectionParams) {
		r = injectInString(param.searchFor, r, param.injectString);
	}
	return r;
}

function injectInString(
	searchFor: string,
	string: string,
	injectString: string,
) {
	const startIndex = string.indexOf(searchFor);
	return (
		string.slice(0, startIndex) +
		injectString +
		string.slice(startIndex + searchFor.length)
	);
}

// renders value should never change unless the server is restarted, just parse and inject once
const cache: {
	val: string | null;
} = {
	val: null,
};

export function renderTrpcPanel(router: AnyTRPCRouter, options: RenderOptions) {
	if (options.cache === true && cache.val) return cache.val;

	const bundleJs = fs.readFileSync(bundlePath).toString();
	const indexHtml = fs.readFileSync(indexPath).toString();
	const indexCss = fs.readFileSync(cssPath).toString();

	const bundleInjectionParams: InjectionParam[] = [
		{
			searchFor: routerReplaceSymbol,
			injectString: JSON.stringify(
				parseRouterWithOptions(router, {
					...defaultParseRouterOptions,
					...options,
				}),
			),
		},
		{
			searchFor: optionsReplaceSymbol,
			injectString: JSON.stringify(options),
		},
	];
	const bundleInjected = injectParams(bundleJs, bundleInjectionParams);

	// Safely handle script content
	const script = `<script type="text/javascript">
// TRPC Panel Bundle
${bundleInjected}
// End TRPC Panel Bundle
</script>`;

	const css = `<style>${indexCss}</style>`;
	const htmlReplaceParams: InjectionParam[] = [
		{
			searchFor: javascriptReplaceSymbol,
			injectString: script,
		},
		{
			searchFor: cssReplaceSymbol,
			injectString: css,
		},
	];
	cache.val = injectParams(indexHtml, htmlReplaceParams);
	return cache.val;
}
