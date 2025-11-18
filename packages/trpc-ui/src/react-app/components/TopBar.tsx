import * as React from "react";
import { useHeadersContext } from "@src/react-app/components/contexts/HeadersContext";
import { LogoSvg } from "@src/react-app/components/LogoSvg";
import { useIsMac } from "@src/react-app/components/hooks/useIsMac";
import { Chevron } from "@src/react-app/components/Chevron";
import { useSearch } from "@src/react-app/components/contexts/SearchStore";
import { Toggle } from "@src/react-app/components/Toggle";
import {
	CookieIcon,
	DownloadIcon,
	MagnifyingGlassIcon,
	MailboxIcon,
	NetworkIcon,
} from "@phosphor-icons/react";

function SubscriptionTransportToggle() {
	const { subscriptionTransport, setSubscriptionTransport } =
		useHeadersContext();

	return (
		<div className="flex items-center mr-3">
			<Toggle
				isActive={subscriptionTransport === "sse"}
				onChange={(isSSE) =>
					setSubscriptionTransport(isSSE ? "sse" : "websocket")
				}
				leftLabel="WebSocket"
				leftIcon={<NetworkIcon className="w-6 h-6" />}
				rightLabel="SSE"
				rightIcon={<DownloadIcon className="w-6 h-6" />}
				leftTooltip="Use WebSocket for subscriptions"
				rightTooltip="Use Server-Sent Events for subscriptions"
			/>
		</div>
	);
}

export function TopBar({
	open,
	setOpen,
}: {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
	const { setHeadersPopupShown, setCookiesPopupShown, getHeaders, getCookies } =
		useHeadersContext();

	const headers = getHeaders();
	const cookies = getCookies();
	const headerCount = Object.keys(headers).length;
	const cookieCount = Object.keys(cookies).length;

	return (
		<div className="w-full px-4 pr-8 flex flex-row justify-between items-center position-fixed left-0 h-16 right-0 top-0 bg-gray-50 drop-shadow-sm bg-actuallyWhite border-b border-b-panelBorder">
			<div className="flex flex-row items-center gap-4">
				<button
					type="button"
					onClick={() => setOpen((prev) => !prev)}
					aria-label="Toggle sidebar"
					aria-pressed={open}
				>
					{open ? (
						<Chevron className="w-4 h-4" direction="left" />
					) : (
						<Chevron className="w-4 h-4" direction="right" />
					)}
				</button>
				<span className="flex flex-row items-center text-lg font-bold font-mono">
					<LogoSvg className="rounded-lg w-10 h-10 mr-2" />
					tRPC.ui()
				</span>
			</div>
			<div className="flex flex-row items-center justify-center flex-1">
				<RouterSearchTooltip />
			</div>
			<div className="flex flex-row items-center ml-auto">
				<SubscriptionTransportToggle />
				<button
					type="button"
					onClick={() => setCookiesPopupShown(true)}
					className="border border-neutralSolidTransparent py-2 px-4 mr-2 text-neutralText font-bold rounded-sm shadow-sm flex items-center"
				>
					<CookieIcon className="w-6 h-6 mr-1" />
					Cookies
					{cookieCount > 0 && (
						<span className="ml-1 bg-neutral-200 dark:bg-neutral-700 text-xs px-1.5 py-0.5 rounded-full">
							{cookieCount}
						</span>
					)}
				</button>
				<button
					type="button"
					onClick={() => setHeadersPopupShown(true)}
					className="border border-neutralSolidTransparent py-2 px-4 text-neutralText font-bold rounded-sm shadow-sm flex items-center"
				>
					<MailboxIcon className="w-6 h-6 mr-1" />
					Headers
					{headerCount > 0 && (
						<span className="ml-1 bg-neutral-200 dark:bg-neutral-700 text-xs px-1.5 py-0.5 rounded-full">
							{headerCount}
						</span>
					)}
				</button>
			</div>
		</div>
	);
}

// import Search from '@mui/icons-material/Search'
export function RouterSearchTooltip() {
	const searchOpen = useSearch((s) => s.searchOpen);
	const setSearchOpen = useSearch((s) => s.setSearchOpen);

	const isMac = useIsMac();
	const helperText = isMac ? "⌘ + P" : "Ctrl + P";
	if (searchOpen) return null;
	return (
		<button
			onClick={() => setSearchOpen(true)}
			type="button"
			className="flex flex-row items-center text-neutralSolidTransparent"
		>
			<MagnifyingGlassIcon className="mr-2 w-5 h-5 color-neutralSolidTransparent" />
			{helperText}
		</button>
	);
}
