import {
	createContext,
	useContext,
	useState,
	type ReactNode,
	useEffect,
} from "react";
import { useLocalStorage } from "@src/react-app/components/hooks/useLocalStorage";

type SubscriptionTransport = "websocket" | "sse";

interface HeadersContextType {
	getHeaders: () => Record<string, string>;
	setHeaders: (headers: Record<string, string>) => void;
	headersPopupShown: boolean;
	setHeadersPopupShown: (shown: boolean) => void;
	getCookies: () => Record<string, string>;
	setCookies: (cookies: Record<string, string>) => void;
	cookiesPopupShown: boolean;
	setCookiesPopupShown: (shown: boolean) => void;
	saveHeadersToLocalStorage: boolean;
	setSaveHeadersToLocalStorage: (save: boolean) => void;
	subscriptionTransport: SubscriptionTransport;
	setSubscriptionTransport: (transport: SubscriptionTransport) => void;
}

const HeadersContext = createContext<HeadersContextType | null>(null);

// Parse cookies from document.cookie string
function parseBrowserCookies(): Record<string, string> {
	if (typeof document === "undefined") return {};

	return document.cookie
		.split(";")
		.map((cookie) => cookie.trim())
		.filter((cookie) => cookie.length > 0)
		.reduce(
			(acc, cookie) => {
				const [name, ...valueParts] = cookie.split("=");
				if (name) {
					const value = valueParts.join("=");
					acc[decodeURIComponent(name.trim())] = decodeURIComponent(value);
				}
				return acc;
			},
			{} as Record<string, string>,
		);
}

// Set a cookie in the browser
function setBrowserCookie(name: string, value: string, days = 30): void {
	if (typeof document === "undefined") return;

	const expires = new Date();
	expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
	document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
}

// Clear a cookie from the browser
function clearBrowserCookie(name: string): void {
	if (typeof document === "undefined") return;

	document.cookie = `${encodeURIComponent(name)}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

export function HeadersContextProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [headersPopupShown, setHeadersPopupShown] = useState(false);
	const [cookiesPopupShown, setCookiesPopupShown] = useState(false);

	const [saveHeadersToLocalStorage, setSaveHeadersToLocalStorage] =
		useLocalStorage("trpc-panel.save-headers", true);
	const [saveCookiesToLocalStorage, _setSaveCookiesToLocalStorage] =
		useLocalStorage("trpc-panel.save-cookies", true);

	const [storedHeaders, setStoredHeaders] = useLocalStorage(
		"trpc-panel.headers",
		"{}",
	);
	const [storedCookies, setStoredCookies] = useLocalStorage(
		"trpc-panel.cookies",
		"{}",
	);

	const [headers, setHeaders] = useState<Record<string, string>>({});
	const [cookies, setCookies] = useState<Record<string, string>>({});

	const [subscriptionTransport, setSubscriptionTransport] =
		useLocalStorage<SubscriptionTransport>(
			"trpc-panel.subscription-transport",
			"websocket",
		);

	// Load cookies from browser on initial load - always sync
	useEffect(() => {
		if (typeof document !== "undefined") {
			// Get browser cookies
			const browserCookies = parseBrowserCookies();

			try {
				// Update our state with browser cookies
				if (saveCookiesToLocalStorage) {
					setStoredCookies(JSON.stringify(browserCookies));
				} else {
					setCookies(browserCookies);
				}
			} catch (e) {
				// Handle parsing error
				console.error("Error loading cookies:", e);
			}
		}
	}, [saveCookiesToLocalStorage, setStoredCookies]);

	const getHeaders = (): Record<string, string> => {
		try {
			if (saveHeadersToLocalStorage) {
				return JSON.parse(storedHeaders);
			}
			return headers;
		} catch (e) {
			return {};
		}
	};

	const getCookies = (): Record<string, string> => {
		try {
			// Always include browser cookies
			if (typeof document !== "undefined") {
				return parseBrowserCookies();
			}

			// Fallback when document is not available (SSR)
			if (saveCookiesToLocalStorage) {
				return JSON.parse(storedCookies);
			}

			return cookies;
		} catch (e) {
			return {};
		}
	};

	// Function to handle cookie updates
	const updateCookies = (newCookies: Record<string, string>) => {
		// Always sync with browser
		if (typeof document !== "undefined") {
			const browserCookies = parseBrowserCookies();

			// Find cookies to add/update in browser
			for (const [name, value] of Object.entries(newCookies)) {
				setBrowserCookie(name, value);
			}

			// Find cookies to remove from browser
			for (const name of Object.keys(browserCookies)) {
				if (!(name in newCookies)) {
					clearBrowserCookie(name);
				}
			}
		}

		// Update local storage or state
		if (saveCookiesToLocalStorage) {
			setStoredCookies(JSON.stringify(newCookies));
		} else {
			setCookies(newCookies);
		}
	};

	return (
		<HeadersContext.Provider
			value={{
				getHeaders,
				setHeaders: (headers) => {
					if (saveHeadersToLocalStorage) {
						setStoredHeaders(JSON.stringify(headers));
					} else {
						setHeaders(headers);
					}
				},
				getCookies,
				setCookies: updateCookies,
				headersPopupShown,
				setHeadersPopupShown,
				cookiesPopupShown,
				setCookiesPopupShown,
				saveHeadersToLocalStorage,
				setSaveHeadersToLocalStorage,
				subscriptionTransport,
				setSubscriptionTransport,
			}}
		>
			{children}
		</HeadersContext.Provider>
	);
}

export function useHeadersContext(): HeadersContextType {
	const context = useContext(HeadersContext);

	if (context === null) {
		throw new Error(
			"useHeadersContext must be used within a HeadersContextProvider",
		);
	}

	return context;
}

export function useHeaders(): Pick<
	HeadersContextType,
	| "getHeaders"
	| "setHeaders"
	| "getCookies"
	| "setCookies"
	| "subscriptionTransport"
> {
	const context = useHeadersContext();
	return {
		getHeaders: context.getHeaders,
		setHeaders: context.setHeaders,
		getCookies: context.getCookies,
		setCookies: context.setCookies,
		subscriptionTransport: context.subscriptionTransport,
	};
}
