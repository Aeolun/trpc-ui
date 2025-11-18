import { useHeadersContext } from "@src/react-app/components/contexts/HeadersContext";
import { useEffect, useState } from "react";
import { BaseTextField } from "@src/react-app/components/form/fields/base/BaseTextField";
import { FieldError } from "@src/react-app/components/form/fields/FieldError";
import { Button } from "@src/react-app/components/Button";
import toast from "react-hot-toast";
import { AddItemButton } from "@src/react-app/components/AddItemButton";
import { BowlSteamIcon, FloppyDiskIcon, XIcon } from "@phosphor-icons/react";

export function CookiesPopup() {
	const {
		cookiesPopupShown,
		setCookiesPopupShown,
		getCookies,
		setCookies: setContextCookies,
	} = useHeadersContext();
	const [cookies, setCookies] = useState<[string, string][]>([]);
	const [errors, setErrors] = useState<boolean[]>([]);

	function addCookie() {
		setCookies((old) => [...old, ["", ""]]);
	}

	function clearErrorIfNecessary(index: number) {
		if (!errors[index]) return;
		const newErrors = [...errors];
		newErrors[index] = false;
		setErrors(newErrors);
	}

	function update(index: number, value: string, type: "key" | "value") {
		const newCookies = [...cookies];
		if (newCookies[index]) {
			const newValue = newCookies[index];
			newValue[type === "key" ? 0 : 1] = value;
			newCookies[index] = newValue;
			setCookies(newCookies);
			clearErrorIfNecessary(index);
		}
	}

	function deleteCookie(index: number) {
		const newCookies = [...cookies];
		const newErrors = [...errors];
		newCookies.splice(index, 1);
		newErrors.splice(index, 1);
		setCookies(newCookies);
		setErrors(newErrors);
	}

	function onExitPress() {
		setCookiesPopupShown(false);
	}

	function onConfirmClick() {
		const newErrors: boolean[] = [...errors];
		let i = 0;
		for (const [cookieKey, cookieValue] of cookies) {
			if (!cookieKey || !cookieValue) {
				newErrors[i] = true;
			}
			i++;
		}
		if (newErrors.some((e) => e)) {
			setErrors(newErrors);
			return;
		}
		setContextCookies(Object.fromEntries(cookies));
		setCookiesPopupShown(false);
		toast("Cookies updated.");
	}

	useEffect(() => {
		if (cookiesPopupShown) {
			setCookies(Object.entries(getCookies()));
		}
	}, [cookiesPopupShown, getCookies]);

	if (!cookiesPopupShown) return null;

	return (
		<div className="fixed flex left-0 right-0 top-0 bottom-0 items-center border border-panelBorder drop-shadow-lg justify-center bg-overlayBackground bg-opacity-70">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					onConfirmClick();
				}}
				className="max-w-2xl w-full bg-white flex flex-col rounded-md space-y-4 dark:bg-neutral-800 dark:text-neutral-200"
			>
				<div className="flex flex-row justify-between border-b p-4 border-panelBorder">
					<h1 className="text-lg font-bold">Cookies</h1>
					<button type="button" onClick={onExitPress}>
						<XIcon className="w-6 h-6" />
					</button>
				</div>
				<div className="px-4 py-2">
					<div className="bg-blue-50 border border-blue-200 text-blue-800 rounded p-3 text-sm flex items-center dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-200">
						<BowlSteamIcon className="w-5 h-5 mr-2" />
						<span>
							Cookies are automatically synced with your browser's cookie store.
							Changes you make here will be saved to your browser and sent with
							requests.{" "}
							<i>
								You may see fewer cookies than expected due to HttpOnly
								settings.
							</i>
						</span>
					</div>
				</div>
				<div className="px-4 py-2 flex flex-col space-y-2">
					{cookies.map(([cookieKey, cookieValue], i) => (
						<div
							className="flex flex-col"
							key={`cookie-${
								// biome-ignore lint/suspicious/noArrayIndexKey: kinda need the array key here, since we cannot key on the constantly changing cookieKey
								i
							}`}
						>
							<div className="flex flex-row items-start">
								<BaseTextField
									className="flex-1"
									label="Name"
									value={cookieKey}
									onChange={(value) => update(i, value, "key")}
								/>
								<span className="w-2 h-1" />
								<BaseTextField
									label="Value"
									className="flex-1"
									value={cookieValue}
									onChange={(value) => update(i, value, "value")}
								/>
								<button
									type="button"
									className="ml-2"
									onClick={() => deleteCookie(i)}
								>
									<XIcon className="w-5 h-5 mt-[0.45rem] mr-2" />
								</button>
							</div>
							{errors[i] && (
								<FieldError errorMessage="Cookies require a name and a value." />
							)}
						</div>
					))}
					<AddItemButton onClick={addCookie} />
				</div>
				<div className="p-4 flex flex-row justify-end border-t border-t-panelBorder">
					<Button variant="query" formNoValidate onClick={onConfirmClick}>
						Confirm <FloppyDiskIcon className="ml-1" />
					</Button>
				</div>
			</form>
		</div>
	);
}
