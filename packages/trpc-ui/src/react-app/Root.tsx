import { type ReactNode, useMemo, useState } from "react";
import { RouterContainer } from "./components/RouterContainer";
import type { ParsedRouter } from "@aeolun/trpc-router-parser";
import type { RenderOptions } from "@src/render";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	HeadersContextProvider,
	useHeaders,
} from "@src/react-app/components/contexts/HeadersContext";
import { useLocalStorage } from "@src/react-app/components/hooks/useLocalStorage";
import { HeadersPopup } from "@src/react-app/components/HeadersPopup";
import { Toaster } from "react-hot-toast";
import { SiteNavigationContextProvider } from "@src/react-app/components/contexts/SiteNavigationContext";
import { SideNav } from "./components/SideNav";
import { TopBar } from "./components/TopBar";
import { AllPathsContextProvider } from "@src/react-app/components/contexts/AllPathsContext";
import { HotKeysContextProvider } from "@src/react-app/components/contexts/HotKeysContext";
import { SearchOverlay } from "@src/react-app/components/SearchInputOverlay";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { trpc, createLinks } from "@src/react-app/trpc";
import { CookiesPopup } from "./components/CookiesPopup";

export function RootComponent({
	rootRouter,
	options,
}: {
	rootRouter: ParsedRouter;
	options: RenderOptions;
}) {
	return (
		<HeadersContextProvider>
			<AllPathsContextProvider rootRouter={rootRouter}>
				<SiteNavigationContextProvider>
					<ClientProviders options={options}>
						<HotKeysContextProvider>
							<SearchOverlay>
								<div className="flex flex-col w-full h-full flex-1 relative">
									<AppInnards rootRouter={rootRouter} />
								</div>
							</SearchOverlay>
						</HotKeysContextProvider>
					</ClientProviders>
				</SiteNavigationContextProvider>
			</AllPathsContextProvider>
		</HeadersContextProvider>
	);
}

function ClientProviders({
	children,
	options,
}: {
	children: ReactNode;
	options: RenderOptions;
}) {
	const headers = useHeaders();

	const trpcClient = useMemo(
		() =>
			trpc.createClient({
				links: createLinks({
					url: options.url,
					wsUrl: options.wsUrl,
					getHeaders: headers.getHeaders,
					subscriptionTransport: headers.subscriptionTransport,
					transformer: options.transformer,
				}),
			}),
		[
			headers.subscriptionTransport,
			headers.getHeaders,
			options.url,
			options.transformer,
		],
	);
	const [queryClient] = useState(() => new QueryClient());

	return (
		<trpc.Provider queryClient={queryClient} client={trpcClient}>
			<QueryClientProvider client={queryClient}>
				{children}
				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
		</trpc.Provider>
	);
}

function AppInnards({ rootRouter }: { rootRouter: ParsedRouter }) {
	const [sidebarOpen, setSidebarOpen] = useLocalStorage(
		"trpc-panel.show-minimap",
		true,
	);

	return (
		<div className="flex flex-col flex-1 relative">
			<TopBar open={sidebarOpen} setOpen={setSidebarOpen} />
			<div className="flex flex-row flex-1 bg-mainBackground">
				<SideNav
					rootRouter={rootRouter}
					open={sidebarOpen}
					setOpen={setSidebarOpen}
				/>
				<div
					className="flex flex-col flex-1 items-center overflow-scroll"
					style={{
						maxHeight: "calc(100vh - 4rem)",
					}}
				>
					<div className="container max-w-6xl p-4 pt-8">
						<RouterContainer router={rootRouter} />
					</div>
				</div>
			</div>
			<HeadersPopup />
			<CookiesPopup />
			<Toaster />
		</div>
	);
}
