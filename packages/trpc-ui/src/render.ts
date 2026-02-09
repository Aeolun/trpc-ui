import type { AnyTRPCRouter } from "@trpc/server";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import {
	parseRouterWithOptions,
	type TrpcPanelExtraOptions,
} from "@aeolun/trpc-router-parser";

export type RenderOptions = {
	url: string;
	wsUrl?: string;
	cache?: boolean;
	subscriptionTransport?: "websocket" | "sse";
	onContentSecurityPolicy?: (hashes: {
		script: string;
		style: string;
	}) => void;
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
	val:
		| {
			html: string;
			hashes: {
				script: string;
				style: string;
			};
		}
		| null;
} = {
	val: null,
};

function createSha256Hash(content: string) {
	return `sha256-${createHash("sha256").update(content).digest("base64")}`;
}

export function renderTrpcPanel(router: AnyTRPCRouter, options: RenderOptions) {
	if (options.cache === true && cache.val) {
		options.onContentSecurityPolicy?.(cache.val.hashes);
		return cache.val.html;
	}

	const bundleJs = fs.readFileSync(bundlePath).toString();
	const indexHtml = fs.readFileSync(indexPath).toString();
	const indexCss = fs.readFileSync(cssPath).toString();

	console.log(`[trpc-ui] Loaded bundle: ${bundleJs.length} bytes at ${new Date().toISOString()}`);

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

	const scriptContent = `
// TRPC Panel Bundle
${bundleInjected}
// End TRPC Panel Bundle
`;
	const styleContent = indexCss;

	const scriptHash = createSha256Hash(scriptContent);
	const styleHash = createSha256Hash(styleContent);

	const script = `<script type="text/javascript">${scriptContent}</script>`;

	const css = `<style>${styleContent}</style>`;
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

	const html = injectParams(indexHtml, htmlReplaceParams);
	const hashes = {
		script: scriptHash,
		style: styleHash,
	};

	options.onContentSecurityPolicy?.(hashes);

	if (options.cache === true) {
		cache.val = {
			html,
			hashes,
		};
	}

	return html;
}
